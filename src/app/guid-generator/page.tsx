"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback, useEffect } from "react";

type GuidVersion = "v4" | "v1" | "v5";
type CaseStyle = "uppercase" | "lowercase";

interface HistoryItem {
  id: string;
  guid: string;
  version: GuidVersion;
  time: number;
}

interface Config {
  version: GuidVersion;
  caseStyle: CaseStyle;
  includeBraces: boolean;
  includeHyphens: boolean;
  quantity: number;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.trunc(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function GuidGeneratorPage() {
  const [config, setConfig, hydrated] = useLocalStorage<Config>("guid_config", {
    version: "v4",
    caseStyle: "uppercase",
    includeBraces: false,
    includeHyphens: true,
    quantity: 5,
  });

  const [history, setHistory] = useLocalStorage<HistoryItem[]>("guid_history", []);
  const [guids, setGuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const generateGuids = useCallback(() => {
    const newGuids: string[] = [];
    const count = Math.min(Math.max(1, config.quantity), 100);
    for (let i = 0; i < count; i++) {
      let guid = generateUUID();
      if (!config.includeHyphens) guid = guid.replaceAll("-", "");
      if (config.caseStyle === "lowercase") guid = guid.toLowerCase();
      else guid = guid.toUpperCase();
      if (config.includeBraces) guid = `{${guid}}`;
      newGuids.push(guid);
    }
    setGuids(newGuids);

    const now = Date.now();
    const newHistoryItems: HistoryItem[] = newGuids.map((g) => ({
      id: Math.random().toString(36).substring(2, 9),
      guid: g,
      version: config.version,
      time: now,
    }));
    
    setHistory((prev) => [...newHistoryItems, ...prev].slice(0, 50));
  }, [config, setHistory]);

  const copyToClipboard = async (text: string, id?: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id || text);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = async () => {
    const allText = guids.join("\n");
    await navigator.clipboard.writeText(allText);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };

  const formatRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">GUID Generator</h2>
          <p className="text-sm text-text-sub mt-1">Generate secure, unique identifiers for your projects.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setGuids([])}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-white border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear Output
          </button>
          <button 
            onClick={generateGuids}
            className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Config and Output */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Config Card */}
          <div className="bg-white rounded-xl border border-border shadow-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">settings</span>
              Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-semibold text-text mb-2.5 block">Version</label>
                  <div className="flex bg-surface-raised p-1 rounded-lg gap-1">
                    {(["v4", "v1", "v5"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setConfig(prev => ({ ...prev, version: v }))}
                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-smooth cursor-pointer ${
                          config.version === v ? "bg-white text-primary shadow-sm" : "text-text-dim hover:text-text-sub"
                        }`}
                      >
                        {v.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-text mb-2.5 block">Case Style</label>
                  <div className="flex gap-4">
                    {["uppercase", "lowercase"].map((s) => (
                      <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`size-4 rounded-full border flex items-center justify-center transition-smooth ${
                          config.caseStyle === s ? "border-primary bg-primary" : "border-border-strong group-hover:border-text-dim"
                        }`}>
                          {config.caseStyle === s && <div className="size-1.5 rounded-full bg-white" />}
                        </div>
                        <input 
                          type="radio" 
                          className="hidden" 
                          checked={config.caseStyle === s}
                          onChange={() => setConfig(prev => ({ ...prev, caseStyle: s as CaseStyle }))} 
                        />
                        <span className="text-[13px] font-medium text-text-sub capitalize">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3 pt-1">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[13px] font-medium text-text-sub">Include braces {"{ }"}</span>
                    <button 
                      onClick={() => setConfig(prev => ({ ...prev, includeBraces: !prev.includeBraces }))}
                      className={`w-9 h-5 rounded-full transition-smooth relative ${config.includeBraces ? "bg-primary" : "bg-border-strong"}`}
                    >
                      <div className={`absolute top-1 size-3 rounded-full bg-white transition-smooth ${config.includeBraces ? "left-5" : "left-1"}`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[13px] font-medium text-text-sub">Use hyphens</span>
                    <button 
                      onClick={() => setConfig(prev => ({ ...prev, includeHyphens: !prev.includeHyphens }))}
                      className={`w-9 h-5 rounded-full transition-smooth relative ${config.includeHyphens ? "bg-primary" : "bg-border-strong"}`}
                    >
                      <div className={`absolute top-1 size-3 rounded-full bg-white transition-smooth ${config.includeHyphens ? "left-5" : "left-1"}`} />
                    </button>
                  </label>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[13px] font-semibold text-text">Quantity</label>
                    <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary-light rounded">{config.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setConfig(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                      className="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-raised transition-smooth text-text-sub cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={config.quantity}
                      onChange={(e) => setConfig(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                      className="flex-1 accent-primary"
                    />
                    <button 
                      onClick={() => setConfig(prev => ({ ...prev, quantity: Math.min(100, prev.quantity + 1) }))}
                      className="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-raised transition-smooth text-text-sub cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output Card */}
          <div className="bg-white rounded-xl border border-border shadow-card flex-1 flex flex-col min-h-[400px]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-green pulse-dot" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim">Generated Output</h3>
              </div>
              {guids.length > 0 && (
                <button 
                  onClick={copyAll}
                  className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 transition-smooth cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied === "all" ? "check" : "content_copy"}
                  </span>
                  {copied === "all" ? "Copied All!" : "Copy All"}
                </button>
              )}
            </div>
            
            <div className={`flex-1 overflow-y-auto ${guids.length === 0 ? "flex items-center justify-center" : "p-4"}`}>
              {guids.length === 0 ? (
                <div className="text-center space-y-3 opacity-40">
                  <span className="material-symbols-outlined text-[48px] block">fingerprint</span>
                  <p className="text-sm font-medium">Results will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guids.map((guid, i) => (
                    <div key={i} className="group flex items-center justify-between p-3.5 bg-surface-raised rounded-xl border border-transparent hover:border-primary/20 transition-smooth">
                      <code className="text-[13px] font-code text-text select-all">{guid}</code>
                      <button 
                        onClick={() => copyToClipboard(guid, `guid-${i}`)}
                        className="size-8 rounded-lg flex items-center justify-center text-text-dim hover:text-primary hover:bg-white transition-smooth shadow-sm opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {copied === `guid-${i}` ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-border shadow-card flex flex-col h-[calc(100vh-180px)]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">history</span>
                Global History
              </h3>
              <button 
                onClick={() => setHistory([])}
                className="text-[11px] font-bold text-accent-red hover:underline transition-smooth cursor-pointer"
              >
                Clear
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-2">
                  <span className="material-symbols-outlined text-[32px]">history_toggle_off</span>
                  <p className="text-xs font-medium">No history yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-3 bg-white border border-border rounded-xl hover:shadow-sm transition-smooth group relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary/10 group-hover:bg-primary transition-smooth" />
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary-light rounded uppercase tracking-wider">{item.version}</span>
                      <span className="text-[10px] font-medium text-text-dim">{formatRelativeTime(item.time)}</span>
                    </div>
                    <code className="text-[11px] font-code text-text-sub block break-all leading-tight ml-1">{item.guid}</code>
                    <button 
                      onClick={() => copyToClipboard(item.guid, item.id)}
                      className="absolute top-2 right-2 size-6 rounded bg-white shadow-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth hover:text-primary cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copied === item.id ? "check" : "content_copy"}
                      </span>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-border bg-surface-raised/50 rounded-b-xl">
              <div className="p-3 bg-white border border-border rounded-lg shadow-sm">
                <p className="text-[11px] font-semibold text-text flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[14px] text-accent-amber">tips_and_updates</span>
                  Pro Tip
                </p>
                <p className="text-[10px] leading-relaxed text-text-dim font-medium">
                  Your generated GUIDs are automatically persisted to your local storage across sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
