"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useEffect, useCallback } from "react";

export default function EpochConverterPage() {
  const [now, setNow] = useState(Date.now());
  const [input, setInput] = useState(Math.floor(Date.now() / 1000).toString());
  const [copied, setCopied] = useState<string | null>(null);

  // Update "Current Time" every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const parsedDate = (() => {
    try {
      if (!input) return null;
      let val = parseInt(input);
      if (isNaN(val)) return null;
      // Heuristic: if value > 10,000,000,000 it's likely ms
      if (val < 10000000000) val *= 1000;
      return new Date(val);
    } catch {
      return null;
    }
  })();

  const isValid = parsedDate && !isNaN(parsedDate.getTime());

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Epoch Converter</h2>
          <p className="text-sm text-text-sub mt-1">Convert Unix timestamps to human-readable dates and vice versa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Time Section */}
        <div className="lg:col-span-12">
           <div className="bg-primary rounded-2xl p-6 shadow-float flex flex-col md:flex-row items-center justify-between gap-6 text-white relative overflow-hidden">
             <div className="absolute -right-8 -bottom-8 size-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
             <div className="absolute left-1/4 -top-8 size-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
             
             <div className="flex flex-col items-center md:items-start">
               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Current Unix Timestamp</span>
               <div className="flex items-center gap-4">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums">{Math.floor(now / 1000)}</span>
                  <button 
                    onClick={() => copyToClipboard(Math.floor(now / 1000).toString(), 'now')}
                    className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-smooth cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {copied === 'now' ? "check" : "content_copy"}
                    </span>
                  </button>
               </div>
             </div>

             <div className="h-px w-full md:h-12 md:w-px bg-white/20" />

             <div className="flex flex-col items-center md:items-end">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Human Readable (Local)</span>
                <span className="text-xl md:text-2xl font-bold tracking-tight">{new Date(now).toLocaleString()}</span>
             </div>
           </div>
        </div>

        {/* Converter Section */}
        <div className="lg:col-span-12">
           <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-surface/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-accent-purple" />
                  <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Converter</span>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setInput(Math.floor(now / 1000).toString())}
                     className="px-3 py-1 text-[11px] font-bold text-primary bg-primary-light rounded border border-primary/10 hover:bg-primary/10 transition-smooth cursor-pointer"
                   >
                     Use Current Time
                   </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                 <div className="max-w-2xl mx-auto space-y-6">
                    <div className="space-y-2">
                       <label className="text-[13px] font-bold text-text-sub ml-1 uppercase tracking-wider">Timestamp (Seconds or MS)</label>
                       <div className="flex gap-3">
                          <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-4 bg-surface-raised rounded-xl border border-border font-code text-[18px] focus:border-primary focus:ring-1 focus:ring-primary/20 transition-smooth"
                          />
                       </div>
                    </div>

                    <div className="flex justify-center">
                       <div className="size-10 rounded-full bg-surface-raised border border-border flex items-center justify-center text-text-dim">
                          <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_down</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-surface-raised/50 rounded-xl border border-border p-5 space-y-3">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Local Time</span>
                             <button onClick={() => isValid && copyToClipboard(parsedDate.toString(), 'local')} className="text-text-dim hover:text-primary transition-smooth">
                                <span className="material-symbols-outlined text-[16px]">{copied === 'local' ? 'check' : 'content_copy'}</span>
                             </button>
                          </div>
                          <p className="text-lg font-bold text-text line-clamp-1">
                             {isValid ? parsedDate.toLocaleString() : <span className="text-accent-red/40 italic font-medium">Invalid input</span>}
                          </p>
                       </div>
                       <div className="bg-surface-raised/50 rounded-xl border border-border p-5 space-y-3">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">UTC Time</span>
                             <button onClick={() => isValid && copyToClipboard(parsedDate.toUTCString(), 'utc')} className="text-text-dim hover:text-primary transition-smooth">
                                <span className="material-symbols-outlined text-[16px]">{copied === 'utc' ? 'check' : 'content_copy'}</span>
                             </button>
                          </div>
                          <p className="text-lg font-bold text-text line-clamp-1">
                             {isValid ? parsedDate.toUTCString() : <span className="text-accent-red/40 italic font-medium">Invalid input</span>}
                          </p>
                       </div>
                    </div>

                    {isValid && (
                      <div className="grid grid-cols-3 gap-3">
                         <div className="p-3 bg-white border border-border rounded-lg text-center">
                            <span className="text-[9px] font-bold text-text-dim uppercase block mb-0.5">Year</span>
                            <span className="text-sm font-bold text-text">{parsedDate.getFullYear()}</span>
                         </div>
                         <div className="p-3 bg-white border border-border rounded-lg text-center">
                            <span className="text-[9px] font-bold text-text-dim uppercase block mb-0.5">Month</span>
                            <span className="text-sm font-bold text-text">{parsedDate.getMonth() + 1}</span>
                         </div>
                         <div className="p-3 bg-white border border-border rounded-lg text-center">
                            <span className="text-[9px] font-bold text-text-dim uppercase block mb-0.5">Day</span>
                            <span className="text-sm font-bold text-text">{parsedDate.getDate()}</span>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
