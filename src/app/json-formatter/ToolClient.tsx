"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback, useMemo } from "react";
import { JsonTree } from "@/components/JsonTree";
import { ValidatedTextarea } from "@/components/ValidatedTextarea";
import { validateJson, ValidationError } from "@/utils/validation";

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

  const [autoSave] = useLocalStorage<boolean>("dev_autosave", true);
  const [maxHistory] = useLocalStorage<number>("dev_max_history", 100);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>("json_history", []);
  
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"raw" | "tree">("tree");
  const [error, setError] = useState<ValidationError | null>(null);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    if (!output) return { lines: 0, size: 0, objects: 0 };
    return {
      lines: output.split("\n").length,
      size: new Blob([output]).size,
      objects: (output.match(/:/g) || []).length
    };
  }, [output]);

  const handleFormat = useCallback((content: string = input, indent: number = config.indent) => {
    if (!content.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    
    const err = validateJson(content);
    if (err) {
      setError(err);
      return;
    }

    try {
      const parsed = JSON.parse(content);
      setParsedData(parsed);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setError(null);

      if (autoSave && content.length > 10) {
        setHistory(prev => {
          if (prev.some(h => h.content === content)) return prev;
          const newItem: HistoryItem = {
            id: Math.random().toString(36).substring(2, 9),
            name: `JSON ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            content: content,
            time: Date.now(),
            size: content.length,
          };
          return [newItem, ...prev].slice(0, maxHistory);
        });
      }
    } catch (e: any) {
      setError({ message: e.message, line: 1, column: 1 });
    }
  }, [input, config.indent, autoSave, maxHistory, setHistory]);

  const handleMinify = useCallback(() => {
    const err = validateJson(input);
    if (err) {
      setError(err);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setParsedData(parsed);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e: any) {
      setError({ message: e.message, line: 1, column: 1 });
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
    <div className="animate-in flex flex-col gap-6 tool-container">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 tool-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">JSON Formatter</h2>
          <p className="text-sm text-text-sub mt-1">Validate, beautify, and minify JSON data instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => { setInput(""); setOutput(""); setError(null); }}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
          <button 
            type="button"
            onClick={() => handleFormat()}
            className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">format_align_left</span>
            Beautify
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-190px)]">
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Input Panel */}
          <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden tool-panel min-h-[300px] md:h-full">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-amber pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Raw Input</span>
              </div>
              <button 
                type="button"
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
            <ValidatedTextarea
              value={input}
              onChange={(val) => {
                setInput(val);
                if (config.validateOnType) {
                   setError(validateJson(val));
                }
              }}
              onPaste={(e) => {
                if (config.autoFormat) {
                  const pastedData = e.clipboardData.getData('text');
                  if (pastedData) {
                    const target = e.target as HTMLTextAreaElement;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const fullText = target.value.substring(0, start) + pastedData + target.value.substring(end);
                    handleFormat(fullText);
                  }
                }
              }}
              error={error}
              placeholder="Paste or type JSON here..."
              className="flex-1"
            />
            {error && (
              <div className="mx-4 mb-4 p-3 bg-accent-red/5 border border-accent-red/10 rounded-lg flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                <span className="material-symbols-outlined text-accent-red text-[18px] shrink-0">error</span>
                <div className="flex flex-col">
                  <p className="text-[11px] font-bold text-accent-red uppercase tracking-widest mb-0.5">Error at Line {error.line}, Col {error.column}</p>
                  <p className="text-[11px] font-medium text-accent-red/80 leading-normal">{error.message}</p>
                </div>
              </div>
            )}
            <div className="px-5 py-2.5 border-t border-border bg-surface-raised flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{input.length} Characters</span>
              <button 
                 type="button"
                 onClick={handleMinify}
                 className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/5 rounded transition-smooth cursor-pointer"
              >
                Compact/Minify
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden tool-panel min-h-[300px] md:h-full">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-green" />
                <div className="flex bg-surface-raised rounded-lg p-0.5 border border-border scale-90 origin-left">
                  <button 
                    onClick={() => setViewMode("raw")}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-smooth ${viewMode === "raw" ? "bg-surface text-primary shadow-sm" : "text-text-dim hover:text-text"}`}
                  >
                    RAW
                  </button>
                  <button 
                    onClick={() => setViewMode("tree")}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-smooth ${viewMode === "tree" ? "bg-surface text-primary shadow-sm" : "text-text-dim hover:text-text"}`}
                  >
                    TREE
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
                <label className="flex items-center shrink-0 gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={config.autoFormat}
                    onChange={(e) => setConfig(prev => ({ ...prev, autoFormat: e.target.checked }))}
                    className="size-3.5 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest group-hover:text-text transition-smooth">Auto-Format</span>
                </label>
                <div className="w-px h-3 bg-border shrink-0" />
                <select 
                  value={config.indent}
                  onChange={(e) => setConfig(prev => ({ ...prev, indent: Number.parseInt(e.target.value, 10) }))}
                  className="text-[11px] font-bold text-text-dim bg-transparent border-none cursor-pointer hover:text-text-sub focus:ring-0"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                  <option value={0}>Tab</option>
                </select>
                <button 
                  type="button"
                  onClick={copyToClipboard}
                  className="size-7 rounded-lg flex items-center justify-center text-text-dim hover:text-primary hover:bg-primary-light transition-smooth cursor-pointer ml-auto sm:ml-0"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex-1 p-5 overflow-auto bg-surface-raised/30 selection:bg-primary-light/30">
              {!output && (
                <span className="text-text-dim/50 italic select-none">Output will appear here...</span>
              )}
              {output && viewMode === "tree" && parsedData !== null && (
                <div className="font-code text-text-sub">
                  <JsonTree data={parsedData} />
                </div>
              )}
              {output && (viewMode !== "tree" || parsedData === null) && (
                <pre className="font-code text-text-sub whitespace-pre-wrap break-all leading-relaxed">
                  {output}
                </pre>
              )}
            </div>
            <div className="px-5 py-2.5 border-t border-border bg-surface-raised flex items-center gap-4 sm:gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">Lines</span>
                <span className="text-[11px] font-bold text-text">{stats.lines}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">Size</span>
                <span className="text-[11px] font-bold text-text">{(stats.size / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-[9px] font-bold text-text-dim uppercase tracking-tighter">Keys</span>
                <span className="text-[11px] font-bold text-text">{stats.objects}</span>
              </div>
              <button 
                type="button"
                onClick={copyToClipboard}
                className="ml-auto px-3 py-1 text-[11px] font-bold text-white bg-primary rounded shadow-sm hover:bg-primary-hover transition-smooth cursor-pointer"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-3 flex flex-col bg-surface rounded-xl border border-border shadow-card overflow-hidden h-[300px] lg:h-full">
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
                <span className="material-symbols-outlined text-[32px] mb-2">data_object</span>
                <p className="text-[11px] font-bold uppercase tracking-wider">No history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
