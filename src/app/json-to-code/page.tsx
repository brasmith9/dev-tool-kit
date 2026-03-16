"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback } from "react";

interface HistoryItem {
  id: string;
  name: string;
  content: string;
  time: number;
  size: number;
}

type Language = "typescript" | "csharp" | "go" | "java" | "python";

const CAPITALIZE_REGEX = /[^a-zA-Z0-9]/g;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replaceAll(CAPITALIZE_REGEX, "");
}

function getSingular(name: string): string {
  return name.endsWith("s") ? name.slice(0, -1) : `${name}Item`;
}

function getArrayType(lang: Language, itemType: string): string {
  const map: Record<Language, string> = {
    go: `[]${itemType}`,
    csharp: `List<${itemType}>`,
    java: `List<${itemType}>`,
    python: `List[${itemType}]`,
    typescript: `${itemType}[]`
  };
  return map[lang];
}

function getPrimitive(lang: Language, type: string, val: any): string {
  if (type === "number") {
    const isInt = val % 1 === 0;
    const map: Record<Language, string> = {
      csharp: isInt ? "int" : "double",
      go: isInt ? "int" : "float64",
      java: isInt ? "Integer" : "Double",
      python: isInt ? "int" : "float",
      typescript: "number"
    };
    return map[lang];
  }
  if (type === "boolean") {
    if (lang === "java") return "Boolean";
    if (lang === "typescript") return "boolean";
    return "bool";
  }
  return lang === "python" ? "str" : (lang === "java" ? "String" : "string");
}

function generateField(lang: Language, key: string, type: string): string {
  const Cap = capitalize(key);
  switch (lang) {
    case "typescript": return `  ${key}: ${type};`;
    case "csharp": return `    public ${type} ${Cap} { get; set; }`;
    case "go": return `    ${Cap} ${type} \`json:"${key}"\``;
    case "java": return `    private ${type} ${key};`;
    case "python": return `    ${key}: ${type}`;
    default: return "";
  }
}

function jsonToCode(json: any, lang: Language, rootName: string = "RootObject"): string {
  const blocks: Map<string, string> = new Map();

  function generate(obj: any, name: string): string {
    if (obj === null) {
      const nullTypes: Record<Language, string> = {
        go: "interface{}", csharp: "object?", java: "Object", python: "Any", typescript: "any"
      };
      return nullTypes[lang];
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        const fallback = lang === "go" ? "interface{}" : (lang === "typescript" ? "any" : "Object");
        return getArrayType(lang, fallback);
      }
      const itemTypes = new Set<string>();
      obj.forEach(item => itemTypes.add(generate(item, getSingular(name))));
      const types = Array.from(itemTypes);
      const type = types.length > 1 && lang === "typescript" ? `(${types.join(" | ")})` : types[0];
      return getArrayType(lang, type);
    }

    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      const fields = keys.map(key => generateField(lang, key, generate(obj[key], capitalize(key))));

      let body = "";
      if (lang === "java") {
        const gs = keys.map(k => {
          const t = generate(obj[k], capitalize(k));
          const C = capitalize(k);
          return `    public ${t} get${C}() { return ${k}; }\n    public void set${C}(${t} ${k}) { this.${k} = ${k}; }`;
        }).join("\n");
        body = `public class ${name} {\n${fields.join("\n")}\n\n${gs}\n}`;
      } else {
        const wrappers: Record<string, string> = {
          typescript: `interface ${name} {\n${fields.join("\n")}\n}`,
          csharp: `public class ${name}\n{\n${fields.join("\n")}\n}`,
          go: `type ${name} struct {\n${fields.join("\n")}\n}`,
          python: `@dataclass\nclass ${name}:\n${fields.join("\n")}`
        };
        body = wrappers[lang];
      }
      blocks.set(name, body);
      return name;
    }

    return getPrimitive(lang, typeof obj, obj);
  }

  try {
    generate(json, rootName);
  } catch (e) {
    return `// Error generating code: ${(e as Error).message}`;
  }

  const result = Array.from(blocks.values()).reverse().join("\n\n");
  const imports: Record<string, string> = {
    python: "from dataclasses import dataclass\nfrom typing import List, Any\n\n",
    java: "import java.util.List;\n\n",
    csharp: "using System.Collections.Generic;\n\n"
  };
  return (imports[lang] || "") + result;
}

export default function JsonToCodePage() {
  const [autoSave] = useLocalStorage<boolean>("dev_autosave", true);
  const [maxHistory] = useLocalStorage<number>("dev_max_history", 100);
  const [history, setHistory, hydrated] = useLocalStorage<HistoryItem[]>("json_code_history", []);

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [rootName, setRootName] = useState("RootObject");
  const [language, setLanguage] = useState<Language>("typescript");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback((content: string = input, name: string = rootName, lang: Language = language) => {
    if (!content.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(content);
      setOutput(jsonToCode(parsed, lang, name));
      setError(null);

      if (autoSave && content.length > 10) {
        setHistory(prev => {
          const key = content + lang;
          if (prev.some(h => h.content === key)) return prev;
          return [{
            id: Math.random().toString(36).substring(2, 9),
            name: `JSON to ${lang.toUpperCase()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            content: key,
            time: Date.now(),
            size: content.length,
          }, ...prev].slice(0, maxHistory);
        });
      }
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
    }
  }, [input, rootName, language, autoSave, maxHistory, setHistory]);

  const copyToClipboard = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromHistory = (item: HistoryItem) => {
    const parts = item.name.split(" ");
    const lang = parts[2].toLowerCase() as Language;
    const content = item.content.slice(0, -lang.length);
    setInput(content);
    setLanguage(lang);
    handleConvert(content, rootName, lang);
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6 tool-container">
      <div className="flex items-end justify-between tool-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">JSON to Code</h2>
          <p className="text-sm text-text-sub mt-1">Convert JSON into native classes, structs, or interfaces for multiple languages.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => { setInput(""); setOutput(""); setError(null); }}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
          <button 
            type="button"
            onClick={() => handleConvert()}
            className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">code</span>{" "}
            Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-190px)]">
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden tool-panel">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-amber pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim leading-none">JSON Input</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  const s = '{\n  "id": 1,\n  "name": "Isaac",\n  "company": {\n    "name": "DevToolkit",\n    "active": true\n  }\n}';
                  setInput(s);
                  handleConvert(s);
                }}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON here..."
              className="flex-1 p-5 font-code text-text bg-transparent resize-none focus:outline-none"
              spellCheck={false}
            />
            {error && (
              <div className="mx-4 mb-4 p-3 bg-accent-red/5 border border-accent-red/10 rounded-lg flex gap-3">
                <span className="material-symbols-outlined text-accent-red text-[18px] shrink-0">error</span>
                <p className="text-[11px] font-medium text-accent-red leading-normal">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden tool-panel">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-blue" />
                <select 
                  value={language}
                  onChange={(e) => {
                    const l = e.target.value as Language;
                    setLanguage(l);
                    handleConvert(input, rootName, l);
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-text-dim bg-transparent border-none focus:ring-0 cursor-pointer hover:text-primary transition-smooth"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="csharp">C# Classes</option>
                  <option value="go">Go Structs</option>
                  <option value="java">Java POJO</option>
                  <option value="python">Python DataClass</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  value={rootName}
                  onChange={(e) => {
                    const n = e.target.value;
                    setRootName(n);
                    handleConvert(input, n, language);
                  }}
                  placeholder="Root Name"
                  className="text-[11px] font-bold text-text-sub bg-transparent border border-border px-2 py-1 rounded focus:outline-none focus:border-primary w-24"
                />
                <button 
                  type="button"
                  onClick={copyToClipboard}
                  className="size-7 rounded-lg flex items-center justify-center text-text-dim hover:text-primary hover:bg-primary-light transition-smooth cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex-1 p-5 overflow-auto bg-surface-raised/30">
              <pre className="font-code text-text-sub whitespace-pre-wrap break-all leading-relaxed">
                {output || <span className="text-text-dim/50 italic select-none">Generated code will appear here...</span>}
              </pre>
            </div>
            <div className="px-5 py-2.5 border-t border-border bg-surface-raised flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest leading-none">
                {output ? `${output.split('\n').length} Lines generated` : 'Ready'}
              </span>
              <button 
                type="button"
                onClick={copyToClipboard}
                disabled={!output}
                className="px-3 py-1 text-[11px] font-bold text-white bg-primary rounded shadow-sm hover:bg-primary-hover transition-smooth cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">history</span>{" "}
              Recently Used
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => loadFromHistory(item)}
                className="w-full text-left p-3 rounded-xl border border-border bg-surface-raised/30 hover:bg-surface hover:shadow-card hover:border-primary/20 transition-smooth group relative overflow-hidden cursor-pointer"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-text truncate mb-0.5">{item.name}</span>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-text-dim uppercase">{(item.size / 1024).toFixed(1)} KB</span>
                     <span className="size-0.5 rounded-full bg-text-dim/30" />
                     <span className="text-[9px] font-semibold text-text-dim">{new Date(item.time).toLocaleDateString()}</span>
                  </div>
                </div>
              </button>
            ))}
            {history.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-4">
                <span className="material-symbols-outlined text-[32px] mb-2">code</span>
                <p className="text-[11px] font-bold uppercase tracking-wider">No history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
