"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback, useMemo } from "react";

interface Config {
  indent: number;
  autoFormat: boolean;
  validateOnType: boolean;
}

interface HistoryItem {
  id: string;
  name: string;
  content: string;
  time: number;
  size: number;
}

export default function JsonFormatterPage() {
  const [config, setConfig, hydrated] = useLocalStorage<Config>("json_config", {
    indent: 2,
    autoFormat: true,
    validateOnType: true,
  });

  const [history, setHistory] = useLocalStorage<HistoryItem[]>("json_history", []);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    if (!output) return { lines: 0, size: 0, objects: 0 };
    return {
      lines: output.split("\n").length,
      size: new Blob([output]).size,
      objects: (output.match(/[:]/g) || []).length
    };
  }, [output]);

  const handleFormat = useCallback((content: string = input, indent: number = config.indent) => {
    if (!content.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setError(null);

      // Add to history if unique and large or meaningful
      if (content.length > 10) {
        setHistory(prev => {
          const exists = prev.find(h => h.content === content);
          if (exists) return prev;
          const newItem: HistoryItem = {
            id: Math.random().toString(36).substring(2, 9),
            name: `JSON ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            content: content,
            time: Date.now(),
            size: content.length,
          };
          return [newItem, ...prev].slice(0, 20);
        });
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, config.indent, setHistory]);

  const handleMinify = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output || input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setInput(item.content);
    handleFormat(item.content);
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">JSON Formatter</h2>
          <p className="text-sm text-text-sub mt-1">Validate, beautify, and minify JSON data instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setInput(""); setOutput(""); setError(null); }}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-white border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
          <button 
            onClick={() => handleFormat()}
            className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">format_align_left</span>
            Beautify
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-190px)]">
        {/* Editor Area */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="bg-white rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-amber pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Raw Input</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const sample = '{"id": "usr_912", "name": "Isaac K.", "role": "admin", "preferences": {"theme": "dark", "notifications": true}, "tags": ["beta", "tester"]}';
                    setInput(sample);
                    handleFormat(sample);
                  }}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Load Sample
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (config.validateOnType) {
                  try { JSON.parse(e.target.value); setError(null); } catch(err) { /* silent */ }
                }
              }}
              placeholder="Paste or type JSON here..."
              className="flex-1 p-5 font-code text-text bg-transparent resize-none focus:outline-none"
              spellCheck={false}
            />
            {error && (
              <div className="mx-4 mb-4 p-3 bg-accent-red/5 border border-accent-red/10 rounded-lg flex gap-3">
                <span className="material-symbols-outlined text-accent-red text-[18px] shrink-0">error</span>
                <p className="text-[11px] font-medium text-accent-red leading-normal">{error}</p>
              </div>
            )}
            <div className="px-5 py-2.5 border-t border-border bg-surface-raised flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{input.length} Characters</span>
              <div className="flex items-center gap-2">
                <button 
                   onClick={handleMinify}
                   className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/5 rounded transition-smooth cursor-pointer"
                >
                  Compact/Minify
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-green" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Beautified</span>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={config.indent}
                  onChange={(e) => setConfig(prev => ({ ...prev, indent: parseInt(e.target.value) }))}
                  className="text-[11px] font-bold text-text-dim bg-transparent border-none cursor-pointer hover:text-text-sub focus:ring-0"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                  <option value={0}>Tab</option>
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
            </div>
            <div className="flex-1 p-5 overflow-auto bg-surface-raised/30">
              <pre className="font-code text-text-sub whitespace-pre-wrap break-all leading-relaxed">
                {output || <span className="text-text-dim/50 italic select-none">Output will appear here...</span>}
              </pre>
            </div>
            <div className="px-5 py-2.5 border-t border-border bg-surface-raised flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">Lines</span>
                <span className="text-[11px] font-bold text-text">{stats.lines}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">Size</span>
                <span className="text-[11px] font-bold text-text">{(stats.size / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">Keys</span>
                <span className="text-[11px] font-bold text-text">{stats.objects}</span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="ml-auto px-3 py-1 text-[11px] font-bold text-white bg-primary rounded shadow-sm hover:bg-primary-hover transition-smooth cursor-pointer"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">history</span>
              Recently Used
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-4">
                <span className="material-symbols-outlined text-[32px] mb-2">data_object</span>
                <p className="text-[11px] font-bold uppercase tracking-wider">No history</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left p-3 rounded-xl border border-border bg-surface-raised/30 hover:bg-white hover:shadow-card hover:border-primary/20 transition-smooth group relative overflow-hidden cursor-pointer"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-text truncate mb-0.5">{item.name}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold text-text-dim uppercase">{(item.size / 1024).toFixed(1)} KB</span>
                       <span className="size-0.5 rounded-full bg-text-dim/30" />
                       <span className="text-[9px] font-semibold text-text-dim">{new Date(item.time).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-text-dim opacity-0 group-hover:opacity-100 transition-smooth">
                    keyboard_double_arrow_right
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="p-4 bg-surface-raised/50 border-t border-border">
             <div className="p-3 bg-white border border-border rounded-lg shadow-sm text-center">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1.5">Tool Settings</p>
                <button 
                   onClick={() => setConfig(prev => ({ ...prev, validateOnType: !prev.validateOnType }))}
                   className={`w-full py-1.5 rounded text-[10px] font-bold transition-smooth border ${config.validateOnType ? "bg-primary-light border-primary/20 text-primary" : "bg-white border-border text-text-dim"}`}
                >
                  {config.validateOnType ? "Strict Validation ON" : "Validation OFF"}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
