"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useMemo, useEffect } from "react";

interface RegexState {
  pattern: string;
  flags: string;
  testText: string;
}

interface MatchResult {
  content: string;
  index: number;
  groups?: string[];
}

export default function RegexTesterPage() {
  const [state, setState, hydrated] = useLocalStorage<RegexState>("regex_state", {
    pattern: "([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\\.[a-zA-Z0-9._-]+)",
    flags: "g",
    testText: "Support can be reached at support@example.com or tech-help@company.co.uk.",
  });

  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    if (!state.pattern || !hydrated) return { matches: [], error: null };
    try {
      const regex = new RegExp(state.pattern, state.flags.includes("g") ? state.flags : state.flags + "g");
      const matches: MatchResult[] = [];
      let match;
      
      // Prevent infinite loops with zero-width matches
      const limit = 1000;
      let iterations = 0;

      while ((match = regex.exec(state.testText)) !== null && iterations < limit) {
        matches.push({
          content: match[0],
          index: match.index,
          groups: match.slice(1),
        });
        if (match.index === regex.lastIndex) regex.lastIndex++;
        iterations++;
      }
      return { matches, error: null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [state, hydrated]);

  const toggleFlag = (flag: string) => {
    const newFlags = state.flags.includes(flag) 
      ? state.flags.replace(flag, "") 
      : state.flags + flag;
    setState(prev => ({ ...prev, flags: newFlags }));
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Regex Tester</h2>
          <p className="text-sm text-text-sub mt-1">Real-time regular expression testing and debugging.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setState({ pattern: "", flags: "g", testText: "" })}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-white border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-190px)]">
        {/* Editor Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Regex Input Card */}
          <div className="bg-white rounded-xl border border-border shadow-card p-6 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">code</span>
              Expression
            </h3>
            
            <div className="flex items-start gap-4 p-1.5 bg-surface-raised rounded-xl border border-border group focus-within:border-primary/50 transition-smooth">
               <div className="px-3 py-2.5 text-text-dim font-bold text-[18px] opacity-40">/</div>
               <input 
                 type="text"
                 value={state.pattern}
                 onChange={(e) => setState(prev => ({ ...prev, pattern: e.target.value }))}
                 placeholder="your-regex-pattern"
                 className="flex-1 py-2.5 font-code text-[16px] bg-transparent focus:outline-none placeholder:text-text-dim/30"
                 spellCheck={false}
               />
               <div className="px-3 py-2.5 text-text-dim font-bold text-[18px] opacity-40">/</div>
               <div className="flex items-center gap-1.5 px-2 py-2">
                 {['g', 'i', 'm', 's', 'u'].map(f => (
                   <button
                     key={f}
                     onClick={() => toggleFlag(f)}
                     className={`size-7 rounded-md text-[11px] font-bold transition-smooth cursor-pointer border flex items-center justify-center ${
                       state.flags.includes(f) 
                        ? "bg-primary text-white border-primary shadow-sm" 
                        : "bg-white text-text-dim border-border hover:border-text-dim/30 hover:text-text-sub"
                     }`}
                     title={`Flag: ${f}`}
                   >
                     {f}
                   </button>
                 ))}
               </div>
            </div>
            {results.error && (
              <div className="mt-3 p-3 bg-accent-red/5 border border-accent-red/10 rounded-lg flex gap-2 animate-in">
                <span className="material-symbols-outlined text-accent-red text-[16px] shrink-0">warning</span>
                <p className="text-[11px] font-bold text-accent-red">{results.error}</p>
              </div>
            )}
          </div>

          {/* Text Input Card */}
          <div className="bg-white rounded-xl border border-border shadow-card flex-1 flex flex-col overflow-hidden">
             <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-amber pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Test String</span>
              </div>
            </div>
            <textarea
              value={state.testText}
              onChange={(e) => setState(prev => ({ ...prev, testText: e.target.value }))}
              placeholder="Enter text to test your regex against..."
              className="flex-1 p-6 font-code text-text bg-transparent resize-none focus:outline-none leading-loose"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
           {/* Summary Tooltips */}
           <div className="bg-white rounded-xl border border-border shadow-card p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-primary-light rounded-xl border border-primary/10">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Total Matches</span>
                  <span className="text-2xl font-black text-primary">{results.matches.length}</span>
                </div>
                <div className="p-3 bg-surface-raised rounded-xl border border-border">
                  <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest block mb-1">Capture Groups</span>
                  <span className="text-2xl font-black text-text-sub">
                    {results.matches[0]?.groups?.length || 0}
                  </span>
                </div>
              </div>
           </div>

           {/* Match List */}
           <div className="bg-white rounded-xl border border-border shadow-card flex-1 flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-surface/50 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">list_alt</span>
                  Match Details
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {results.matches.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-2">
                    <span className="material-symbols-outlined text-[32px]">search_off</span>
                    <p className="text-[11px] font-bold uppercase tracking-wider">No matches found</p>
                  </div>
                ) : (
                  results.matches.map((m, i) => (
                    <div key={i} className="p-3.5 bg-surface-raised/50 rounded-xl border border-border transition-smooth hover:border-primary/30 group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Match {i + 1}</span>
                        <span className="text-[9px] font-bold text-text-dim uppercase">Index {m.index}</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-border-strong/10 mb-2">
                        <code className="text-[12px] font-code text-primary font-bold">{m.content}</code>
                      </div>
                      {m.groups && m.groups.length > 0 && (
                        <div className="space-y-1 mt-2 pt-2 border-t border-border">
                           <span className="text-[9px] font-bold text-text-dim uppercase block mb-1">Groups</span>
                           {m.groups.map((g, gi) => (
                             <div key={gi} className="flex items-start gap-2">
                               <span className="text-[9px] font-bold text-primary mt-0.5">${gi + 1}:</span>
                               <code className="text-[11px] font-code text-text-sub break-all">{g || <span className="italic opacity-30">undefined</span>}</code>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
