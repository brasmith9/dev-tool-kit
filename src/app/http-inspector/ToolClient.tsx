"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useMemo } from "react";
import { JsonTree } from "@/components/JsonTree";

interface HistoryItem {
  id: string;
  name: string;
  content: string;
  time: number;
  size: number;
}

interface ParsedHttp {
  method: string;
  path: string;
  version: string;
  headers: Record<string, string>;
  body: string | null;
}

function parseRawHttp(raw: string): ParsedHttp | null {
  if (!raw.trim()) return null;

  const lines = raw.split(/\r?\n/);
  const requestLine = lines[0];
  const parts = requestLine.split(" ");
  
  if (parts.length < 2) return null;

  const result: ParsedHttp = {
    method: parts[0],
    path: parts[1],
    version: parts[2] || "HTTP/1.1",
    headers: {},
    body: null
  };

  let i = 1;
  while (i < lines.length && lines[i].trim() !== "") {
    const line = lines[i];
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      result.headers[key] = value;
    }
    i++;
  }

  const remaining = lines.slice(i + 1).join("\n").trim();
  if (remaining) {
    result.body = remaining;
  }

  return result;
}

export default function HttpInspectorPage() {
  const [, , hydrated] = useLocalStorage<HistoryItem[]>("http_inspector_history", []);
  const [input, setInput] = useState("");
  const [viewMode, setViewMode] = useState<"raw" | "tree">("tree");
  
  const parsed = useMemo(() => parseRawHttp(input), [input]);

  const handleClear = () => {
    setInput("");
  };

  const handleLoadSample = () => {
    const sample = `POST /v1/api/users HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\nAuthorization: Bearer sample_token\nAccept: */*\n\n{\n  "firstName": "Isaac",\n  "lastName": "Anane",\n  "role": "admin"\n}`;
    setInput(sample);
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">HTTP Inspector</h2>
          <p className="text-sm text-text-sub mt-1">Parse and visualize raw HTTP request text into structured data.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleClear}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
          <button 
            type="button"
            onClick={handleLoadSample}
            className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center justify-center gap-2 cursor-pointer"
          >
             <span className="material-symbols-outlined text-[18px]">visibility</span>{" "}
             Load Sample
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[calc(100vh-190px)]">
        {/* Editor */}
        <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden min-h-[300px] lg:h-full">
          <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-text-dim leading-none">Raw HTTP Request</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw HTTP request here..."
            className="flex-1 p-5 font-code text-text bg-transparent resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Results */}
        <div className="flex flex-col gap-6 overflow-y-auto lg:h-full">
          {parsed ? (
            <>
              {/* Request Line */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim leading-none">Request Line</h3>
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1.5 bg-primary/10 rounded-lg">
                    <span className="text-[10px] font-bold text-primary uppercase block">Method</span>
                    <span className="text-[14px] font-code font-bold text-primary">{parsed.method}</span>
                  </div>
                  <div className="flex-1 min-w-[150px] px-3 py-1.5 bg-surface-raised rounded-lg border border-border">
                    <span className="text-[10px] font-bold text-text-dim uppercase block">Path</span>
                    <span className="text-[14px] font-code font-bold text-text truncate block">{parsed.path}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-surface-raised rounded-lg border border-border">
                    <span className="text-[10px] font-bold text-text-dim uppercase block font-sans">Version</span>
                    <span className="text-[14px] font-code font-bold text-text">{parsed.version}</span>
                  </div>
                </div>
              </div>

              {/* Headers */}
              <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-surface/50">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-dim leading-none">Headers ({Object.keys(parsed.headers).length})</span>
                </div>
                <div className="p-4 space-y-1">
                  {Object.entries(parsed.headers).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:gap-4 p-2 rounded-lg hover:bg-surface-raised transition-smooth group shrink-0">
                      <span className="sm:w-1/3 text-[12px] font-bold text-text-sub truncate">{key}</span>
                      <span className="flex-1 text-[12px] font-code text-text break-all">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              {parsed.body && (
                 <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden shrink-0">
                  <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-dim leading-none">Payload Body</span>
                    {(() => {
                      try {
                        JSON.parse(parsed.body!);
                        return (
                          <div className="flex bg-surface-raised rounded-lg p-0.5 border border-border scale-90 origin-right">
                            <button 
                              type="button"
                              onClick={() => setViewMode("raw")}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-smooth ${viewMode === "raw" ? "bg-surface text-primary shadow-sm" : "text-text-dim hover:text-text"}`}
                            >
                              RAW
                            </button>
                            <button 
                              type="button"
                              onClick={() => setViewMode("tree")}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-smooth ${viewMode === "tree" ? "bg-surface text-primary shadow-sm" : "text-text-dim hover:text-text"}`}
                            >
                              TREE
                            </button>
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                  <div className="p-5 bg-surface-raised/30 selection:bg-primary-light/30">
                    {(() => {
                      if (viewMode === "tree") {
                        try {
                          const parsedBody = JSON.parse(parsed.body!);
                          return (
                            <div className="font-code text-text-sub overflow-auto">
                              <JsonTree data={parsedBody} />
                            </div>
                          );
                        } catch {
                          // Fallback
                        }
                      }
                      return (
                        <pre className="font-code text-[13px] text-text-sub whitespace-pre-wrap break-all leading-relaxed">
                          {parsed.body}
                        </pre>
                      );
                    })()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-48 lg:h-full flex flex-col items-center justify-center bg-surface rounded-xl border border-border border-dashed opacity-30 p-10 text-center">
              <span className="material-symbols-outlined text-[48px] mb-4">rebase_edit</span>
              <p className="text-sm font-bold uppercase tracking-wider">Paste a valid HTTP request to inspect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
