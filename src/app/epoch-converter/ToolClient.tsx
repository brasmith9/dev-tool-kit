"use client";

import { useState, useEffect } from "react";

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
      const trimmed = input.trim();
      if (!trimmed) return null;
      
      // If it looks like a pure number (seconds or milliseconds)
      if (/^\d+$/.test(trimmed)) {
        let val = parseInt(trimmed, 10);
        if (Number.isNaN(val)) return null;
        // Heuristic: if value < 10,000,000,000 it's likely seconds, otherwise milliseconds
        if (val < 10000000000) val *= 1000;
        return new Date(val);
      }

      // Try parsing as ISO/Date string
      const date = new Date(trimmed);
      if (!Number.isNaN(date.getTime())) return date;
      
      return null;
    } catch {
      return null;
    }
  })();

  const isValid = parsedDate && !Number.isNaN(parsedDate.getTime());

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Epoch Converter</h2>
          <p className="text-sm text-text-sub mt-1">Convert between Unix timestamps and human-readable dates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        {/* Current Time Section */}
        <div className="lg:col-span-12">
           <div className="bg-primary rounded-2xl p-6 shadow-float flex flex-col md:flex-row items-center justify-between gap-6 text-white relative overflow-hidden">
             <div className="absolute -right-8 -bottom-8 size-48 bg-surface/5 rounded-full blur-3xl pointer-events-none" />
             <div className="absolute left-1/4 -top-8 size-32 bg-surface/10 rounded-full blur-2xl pointer-events-none" />
             
             <div className="flex flex-col items-center md:items-start shrink-0">
               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Current Unix Timestamp</span>
               <div className="flex items-center gap-4">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums">{Math.floor(now / 1000)}</span>
                  <button 
                    onClick={() => copyToClipboard(Math.floor(now / 1000).toString(), 'now')}
                    className="size-10 rounded-full bg-surface/10 hover:bg-surface/20 flex items-center justify-center transition-smooth cursor-pointer"
                    aria-label="Copy current timestamp"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {copied === 'now' ? "check" : "content_copy"}
                    </span>
                  </button>
               </div>
             </div>

             <div className="h-px w-full md:h-12 md:w-px bg-surface/20" />

             <div className="flex flex-col items-center md:items-end overflow-hidden">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Human Readable (Local)</span>
                <span className="text-xl md:text-2xl font-bold tracking-tight truncate max-w-full">{new Date(now).toLocaleString()}</span>
             </div>
           </div>
        </div>

        {/* Main Converter */}
        <div className="lg:col-span-12">
           <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-accent-purple shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Bidirectional Converter</span>
                </div>
                <div className="flex items-center gap-2">
                   <input 
                     type="datetime-local" 
                     className="bg-surface-raised border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                     onChange={(e) => {
                       if (e.target.value) {
                         const d = new Date(e.target.value);
                         if (!Number.isNaN(d.getTime())) setInput(Math.floor(d.getTime() / 1000).toString());
                       }
                     }}
                   />
                   <button 
                     onClick={() => setInput(Math.floor(now / 1000).toString())}
                     className="px-3 py-1.5 text-[11px] font-bold text-primary bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-smooth cursor-pointer"
                   >
                     Use Now
                   </button>
                </div>
              </div>

              <div className="p-8">
                 <div className="max-w-3xl mx-auto space-y-10">
                    <div className="space-y-4">
                       <label className="text-[13px] font-bold text-text-sub ml-1 uppercase tracking-wider flex items-center justify-between">
                         Input Value (Timestamp or Date)
                         <span className="text-[10px] font-medium normal-case opacity-60 italic">Supports Unix seconds, ms, or ISO strings</span>
                       </label>
                       <input 
                         type="text"
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         placeholder="e.g. 1710795933 or 2026-03-18T20:34:03Z"
                         className="w-full p-5 bg-surface-raised rounded-2xl border border-border font-code text-[20px] focus:border-primary focus:ring-1 focus:ring-primary/10 transition-smooth placeholder:text-text-dim/20"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dates Grid */}
                        <div className="bg-surface-raised/30 rounded-2xl border border-border p-6 space-y-4 group hover:border-primary/20 transition-smooth">
                           <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Local Date/Time</span>
                                <p className="text-[15px] font-bold text-text mt-1">
                                   {isValid ? parsedDate.toLocaleString() : <span className="opacity-20 italic">Invalid input...</span>}
                                </p>
                              </div>
                              <button 
                                onClick={() => isValid && copyToClipboard(parsedDate.toString(), 'local')} 
                                className={`size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-dim hover:text-primary transition-smooth ${isValid ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
                              >
                                 <span className="material-symbols-outlined text-[16px]">{copied === 'local' ? 'check' : 'content_copy'}</span>
                              </button>
                           </div>
                           <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">UTC Date/Time</span>
                                <p className="text-[15px] font-bold text-text mt-1">
                                   {isValid ? parsedDate.toUTCString() : <span className="opacity-20">---</span>}
                                </p>
                              </div>
                              <button 
                                onClick={() => isValid && copyToClipboard(parsedDate.toUTCString(), 'utc')} 
                                className={`size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-dim hover:text-primary transition-smooth ${isValid ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
                              >
                                 <span className="material-symbols-outlined text-[16px]">{copied === 'utc' ? 'check' : 'content_copy'}</span>
                              </button>
                           </div>
                        </div>

                        {/* Timestamps Grid */}
                        <div className="bg-surface-raised/30 rounded-2xl border border-border p-6 space-y-4 group hover:border-primary/20 transition-smooth">
                           <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Unix Seconds (s)</span>
                                <p className="font-code text-[18px] font-bold text-primary mt-1">
                                   {isValid ? Math.floor(parsedDate.getTime() / 1000) : <span className="opacity-20 italic font-sans text-sm">Waiting...</span>}
                                </p>
                              </div>
                              <button 
                                onClick={() => isValid && copyToClipboard(Math.floor(parsedDate.getTime() / 1000).toString(), 's')} 
                                className={`size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-dim hover:text-primary transition-smooth ${isValid ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
                              >
                                 <span className="material-symbols-outlined text-[16px]">{copied === 's' ? 'check' : 'content_copy'}</span>
                              </button>
                           </div>
                           <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Unix Milliseconds (ms)</span>
                                <p className="font-code text-[18px] font-bold text-text mt-1">
                                   {isValid ? parsedDate.getTime() : <span className="opacity-20 italic font-sans text-sm">---</span>}
                                </p>
                              </div>
                              <button 
                                onClick={() => isValid && copyToClipboard(parsedDate.getTime().toString(), 'ms')} 
                                className={`size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-dim hover:text-primary transition-smooth ${isValid ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
                              >
                                 <span className="material-symbols-outlined text-[16px]">{copied === 'ms' ? 'check' : 'content_copy'}</span>
                              </button>
                           </div>
                        </div>
                    </div>

                    {isValid && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in">
                         {[
                           { k: "Year", v: parsedDate.getFullYear() },
                           { k: "Month", v: parsedDate.getMonth() + 1 },
                           { k: "Day", v: parsedDate.getDate() },
                           { k: "Time", v: parsedDate.toLocaleTimeString([], { hour12: false }) },
                         ].map(i => (
                           <div key={i.k} className="p-4 bg-surface border border-border rounded-xl text-center hover:shadow-sm transition-smooth font-display">
                              <span className="text-[9px] font-black text-text-dim uppercase block mb-1 tracking-widest">{i.k}</span>
                              <span className="text-[15px] font-bold text-text">{i.v}</span>
                           </div>
                         ))}
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
