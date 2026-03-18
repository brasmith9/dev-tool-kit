"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback } from "react";
import { ValidatedTextarea } from "@/components/ValidatedTextarea";
import { validateCurl, ValidationError } from "@/utils/validation";

interface HistoryItem {
  id: string;
  name: string;
  content: string;
  time: number;
  size: number;
}

type TargetLang = "javascript-fetch" | "javascript-axios" | "python-requests" | "go-http" | "php-curl" | "csharp-httpclient";

interface CurlParsed {
  method: string;
  url: string;
  headers: Record<string, string>;
  data: string | null;
}

function parseCurl(curl: string): CurlParsed {
  const result: CurlParsed = {
    method: "GET",
    url: "",
    headers: {},
    data: null
  };

  // Simple regex-based parser (not exhaustive but handles most common cases)
  const lines = curl.replaceAll(/\\\n/g, " ").split(/\s+/);
  
  for (let i = 0; i < lines.length; i++) {
    const part = lines[i];
    const next = lines[i+1]?.replaceAll(/^['"]|['"]$/g, "");

    if ((part === "-X" || part === "--request") && next) {
      result.method = next.toUpperCase();
      i++;
    } else if ((part === "-H" || part === "--header") && next) {
      const separatorIndex = next.indexOf(":");
      if (separatorIndex !== -1) {
        const key = next.substring(0, separatorIndex).trim();
        const value = next.substring(separatorIndex + 1).trim();
        result.headers[key] = value;
      }
      i++;
    } else if ((part === "-d" || part === "--data" || part === "--data-raw" || part === "--data-binary") && next) {
      result.data = next;
      if (result.method === "GET") result.method = "POST";
      i++;
    } else if (part.startsWith("http")) {
      result.url = part.replaceAll(/^['"]|['"]$/g, "");
    } else if (i === 1 && !part.startsWith("-")) {
       // Often 'curl URL'
       result.url = part.replace(/^['"]|['"]$/g, "");
    }
  }

  if (!result.url && lines[1]) result.url = lines[1].replaceAll(/^['"]|['"]$/g, "");

  return result;
}

function generateCode(parsed: CurlParsed, lang: TargetLang): string {
  const { method, url, headers, data } = parsed;
  const headerKeys = Object.keys(headers);

  switch (lang) {
    case "javascript-fetch":
      return `const response = await fetch("${url}", {
  method: "${method}",
  headers: {
${headerKeys.map(k => `    "${k}": "${headers[k]}"`).join(",\n")}
  }${data ? `,\n  body: JSON.stringify(${data})` : ""}
});
const result = await response.json();`;

    case "python-requests":
      return `import requests
import json

url = "${url}"
headers = {
${headerKeys.map(k => `    "${k}": "${headers[k]}"`).join(",\n")}
}
${data ? `payload = ${data}\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=payload)` : `response = requests.${method.toLowerCase()}(url, headers=headers)`}

print(response.json())`;

    case "go-http":
      return `package main

import (
    "fmt"
    "net/http"
    "io/ioutil"
    ${data ? `"bytes"\n    "encoding/json"` : ""}
)

func main() {
    url := "${url}"
    ${data ? `payload, _ := json.Marshal(${data})\n    req, _ := http.NewRequest("${method}", url, bytes.NewBuffer(payload))` : `req, _ := http.NewRequest("${method}", url, nil)`}

    ${headerKeys.map(k => `req.Header.Add("${k}", "${headers[k]}")`).join("\n    ")}

    client := &http.Client{}
    res, _ := client.Do(req)
    defer res.Body.Close()

    body, _ := ioutil.ReadAll(res.Body)
    fmt.Println(string(body))
}`;

    case "csharp-httpclient":
      return `using var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.${capitalize(method.toLowerCase())}, "${url}");
${headerKeys.map(k => `request.Headers.TryAddWithoutValidation("${k}", "${headers[k]}");`).join("\n")}
${data ? `request.Content = new StringContent(${JSON.stringify(data)}, Encoding.UTF8, "application/json");` : ""}

var response = await client.SendAsync(request);
var content = await response.Content.ReadAsStringAsync();`;

    default:
      return "// Code generation for this language is coming soon.";
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function CurlConverterPage() {
  const [, setHistory] = useLocalStorage<HistoryItem[]>("curl_history", []);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<TargetLang>("javascript-fetch");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);

  const handleConvert = useCallback((content: string = input, lang: TargetLang = language) => {
    if (!content.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    const err = validateCurl(content);
    if (err) {
      setError(err);
      // We still try to parse if possible, or just show error
    } else {
      setError(null);
    }

    const parsed = parseCurl(content);
    const code = generateCode(parsed, lang);
    setOutput(code);

    if (content.length > 20) {
      setHistory(prev => {
        if (prev.some(h => h.content === content)) return prev;
        return [{
          id: Math.random().toString(36).substring(2, 9),
          name: `cURL to ${lang.split('-')[0].toUpperCase()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          content: content,
          time: Date.now(),
          size: content.length,
        }, ...prev].slice(0, 10);
      });
    }
  }, [input, language, setHistory]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">cURL Converter</h2>
          <p className="text-sm text-text-sub mt-1">Transform cURL commands into ready-to-use code for various languages.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setInput(""); setOutput(""); }}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
          <button 
            onClick={() => handleConvert()}
            className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center gap-2 cursor-pointer"
          >
             <span className="material-symbols-outlined text-[18px]">transform</span>
             Convert
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-190px)]">
        {/* Input */}
        <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-text-dim">cURL Command</span>
            <button 
              onClick={() => {
                const sample = 'curl -X POST "https://api.example.com/v1/users" \\\n  -H "Authorization: Bearer my_token" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"name": "Isaac", "role": "admin"}\'';
                setInput(sample);
                handleConvert(sample);
              }}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              Load Sample
            </button>
          </div>
          <ValidatedTextarea
            value={input}
            onChange={(val) => {
              setInput(val);
              setError(validateCurl(val));
            }}
            error={error}
            placeholder="Paste your cURL command here..."
            className="flex-1"
          />
          {error && (
            <div className="mx-4 mb-4 p-3 bg-accent-red/5 border border-accent-red/10 rounded-lg flex gap-3 animate-in fade-in slide-in-from-bottom-2">
              <span className="material-symbols-outlined text-accent-red text-[18px] shrink-0">error</span>
              <div className="flex flex-col">
                <p className="text-[11px] font-bold text-accent-red uppercase tracking-widest mb-0.5">Linter Warning</p>
                <p className="text-[11px] font-medium text-accent-red/80 leading-normal">{error.message} (Line {error.line})</p>
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
            <select 
              value={language}
              onChange={(e) => {
                const l = e.target.value as TargetLang;
                setLanguage(l);
                handleConvert(input, l);
              }}
              className="text-xs font-bold uppercase tracking-widest text-text-dim bg-transparent border-none focus:ring-0 cursor-pointer hover:text-primary transition-smooth"
            >
              <option value="javascript-fetch">JS (Fetch)</option>
              <option value="javascript-axios">JS (Axios)</option>
              <option value="python-requests">Python (Requests)</option>
              <option value="go-http">Go (http)</option>
              <option value="csharp-httpclient">C# (HttpClient)</option>
            </select>
            <button 
              onClick={copyToClipboard}
              className="size-7 rounded-lg flex items-center justify-center text-text-dim hover:text-primary hover:bg-primary-light transition-smooth cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? "check" : "content_copy"}
              </span>
            </button>
          </div>
          <div className="flex-1 p-5 overflow-auto bg-surface-raised/30">
            <pre className="font-code text-text-sub whitespace-pre-wrap break-all leading-relaxed">
              {output || <span className="text-text-dim/50 italic select-none">Code will appear here...</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
