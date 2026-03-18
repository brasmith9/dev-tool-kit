"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useMemo, useEffect } from "react";
import CryptoJS from "crypto-js";

interface Config {
  uppercase: boolean;
  autoUpdate: boolean;
}

interface HashResult {
  algo: string;
  hash: string;
}

export default function HashGeneratorPage() {
  const [input, setInput, hydratedInput] = useLocalStorage<string>("hash_input", "Hello DevToolkit");
  const [config, setConfig, hydratedConfig] = useLocalStorage<Config>("hash_config", {
    uppercase: true,
    autoUpdate: true,
  });

  const [copied, setCopied] = useState<string | null>(null);

  const hashes = useMemo((): HashResult[] => {
    if (!input || !hydratedInput) return [];
    
    const algos = [
      { name: "MD5", fn: CryptoJS.MD5 },
      { name: "SHA-1", fn: CryptoJS.SHA1 },
      { name: "SHA-256", fn: CryptoJS.SHA256 },
      { name: "SHA-512", fn: CryptoJS.SHA512 },
      { name: "SHA-3", fn: CryptoJS.SHA3 },
      { name: "RIPEMD-160", fn: CryptoJS.RIPEMD160 },
    ];

    return algos.map(a => {
      let hash = a.fn(input).toString();
      if (config.uppercase) hash = hash.toUpperCase();
      return { algo: a.name, hash };
    });
  }, [input, config.uppercase, hydratedInput]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!hydratedInput || !hydratedConfig) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Hash Generator</h2>
          <p className="text-sm text-text-sub mt-1">Generate cryptographic hashes for strings and files.</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setInput("")}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Area */}
        <div className="lg:col-span-12">
          <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
             <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-amber pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Input Content</span>
              </div>
              <div className="flex items-center gap-6">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[11px] font-bold text-text-dim uppercase group-hover:text-text-sub transition-smooth">Uppercase Hash</span>
                    <button 
                      onClick={() => setConfig(prev => ({ ...prev, uppercase: !prev.uppercase }))}
                      className={`w-8 h-4.5 rounded-full transition-smooth relative ${config.uppercase ? "bg-primary" : "bg-border-strong"}`}
                    >
                      <div className={`absolute top-0.5 size-3.5 rounded-full bg-surface transition-smooth ${config.uppercase ? "left-4" : "left-0.5"}`} />
                    </button>
                 </label>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text here to generate hashes..."
              className="w-full p-6 font-code text-text bg-transparent resize-none focus:outline-none min-h-[120px] leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hashes.map((item) => (
                <div key={item.algo} className="bg-surface rounded-xl border border-border shadow-card p-5 group hover:border-primary/20 transition-smooth">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black bg-surface-raised border border-border text-text-dim px-2 py-0.5 rounded uppercase tracking-tighter">
                            {item.algo}
                         </span>
                         <span className="text-[10px] font-bold text-text-dim/40 uppercase tracking-widest">
                            {item.hash.length * 4}-bit
                         </span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(item.hash, item.algo)}
                        className="size-8 rounded-lg flex items-center justify-center text-text-dim hover:text-primary hover:bg-primary-light transition-smooth cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {copied === item.algo ? "check" : "content_copy"}
                        </span>
                      </button>
                   </div>
                   <div className="p-3 bg-surface-raised/50 rounded-lg border border-border-strong/10 relative overflow-hidden">
                      <code className="text-[12px] font-code text-text-sub break-all block leading-tight">
                        {item.hash}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(item.hash, item.algo)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Click to copy hash"
                      />
                   </div>
                   {copied === item.algo && (
                     <div className="mt-2 text-[10px] font-bold text-accent-green flex items-center gap-1 animate-in">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Copied to clipboard
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
