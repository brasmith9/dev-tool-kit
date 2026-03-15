"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useMemo } from "react";
import cronstrue from "cronstrue";

export default function CronParserPage() {
  const [input, setInput, hydrated] = useLocalStorage<string>("cron_input", "*/15 * * * *");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input || !hydrated) return { human: "", error: null };
    try {
      return { 
        human: cronstrue.toString(input, { use24HourTimeFormat: true }), 
        error: null 
      };
    } catch (e) {
      return { human: "", error: (e as Error).toString().replace("Error: ", "") };
    }
  }, [input, hydrated]);

  const samples = [
    "*/5 * * * *",
    "0 0 * * *",
    "0 12 * * MON-FRI",
    "0 0 1 1 *",
    "30 8-18 * * 1-5",
  ];

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Cron Parser</h2>
          <p className="text-sm text-text-sub mt-1">Convert cryptic cron expressions into human-readable descriptions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setInput("")}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-white border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-surface/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-accent-amber pulse-dot" />
                  <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Cron Expression</span>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="relative">
                   <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="* * * * *"
                    className={`w-full p-5 bg-surface-raised rounded-xl border font-code text-[24px] text-center tracking-widest focus:ring-2 focus:ring-primary/20 focus:outline-none transition-smooth ${
                      result.error ? "border-accent-red/50" : "border-border focus:border-primary"
                    }`}
                  />
                  {result.error && (
                    <div className="absolute -bottom-6 left-0 right-0 text-center animate-in">
                      <span className="text-[10px] font-bold text-accent-red uppercase tracking-widest">{result.error}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-2">
                   {samples.map(s => (
                     <button 
                       key={s}
                       onClick={() => setInput(s)}
                       className="px-3 py-1 text-[11px] font-bold text-text-dim border border-border rounded-lg hover:border-primary/30 hover:text-primary transition-smooth cursor-pointer"
                     >
                       {s}
                     </button>
                   ))}
                </div>
              </div>
           </div>

           <div className={`rounded-2xl border-2 p-10 transition-smooth flex flex-col items-center justify-center text-center ${
              result.error ? "bg-accent-red/5 border-accent-red/10 animate-pulse" : "bg-primary/5 border-primary/20"
           }`}>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text-dim mb-4 opacity-40">English Description</span>
              <p className={`text-2xl md:text-3xl font-black tracking-tight leading-relaxed ${
                result.error ? "text-accent-red/40 italic" : "text-primary"
              }`}>
                {result.error ? "Waiting for valid input..." : `"${result.human}"`}
              </p>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-xl border border-border shadow-card p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px]">info</span>
                 Cron Reference
              </h3>
              <div className="space-y-3">
                 {[
                   { label: "Minute", range: "0 - 59" },
                   { label: "Hour", range: "0 - 23" },
                   { label: "Day of Month", range: "1 - 31" },
                   { label: "Month", range: "1 - 12 (or JAN-DEC)" },
                   { label: "Day of Week", range: "0 - 7 (or SUN-SAT)" },
                 ].map((ref, i) => (
                   <div key={i} className="flex items-center justify-between text-[11px] font-medium border-b border-border pb-2">
                     <span className="text-text-sub">{ref.label}</span>
                     <span className="text-primary font-bold font-code">{ref.range}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-5 bg-surface-raised rounded-xl border border-border shadow-sm">
              <p className="text-[11px] font-bold text-text-dim uppercase tracking-widest mb-3">Quick Explainers</p>
              <ul className="space-y-2">
                 <li className="flex gap-2">
                    <span className="text-primary font-bold font-code text-xs">*</span>
                    <span className="text-[10px] font-medium text-text-sub">Every value</span>
                 </li>
                 <li className="flex gap-2">
                    <span className="text-primary font-bold font-code text-xs">,</span>
                    <span className="text-[10px] font-medium text-text-sub">Value list separator</span>
                 </li>
                 <li className="flex gap-2">
                    <span className="text-primary font-bold font-code text-xs">-</span>
                    <span className="text-[10px] font-medium text-text-sub">Range of values</span>
                 </li>
                 <li className="flex gap-2">
                    <span className="text-primary font-bold font-code text-xs">/</span>
                    <span className="text-[10px] font-medium text-text-sub">Step values (increments)</span>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
