"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useMemo } from "react";
import * as jsondiffpatch from "jsondiffpatch";

interface DiffState {
  left: string;
  right: string;
}

export default function JsonDiffPage() {
  const [state, setState, hydrated] = useLocalStorage<DiffState>("json_diff_state", {
    left: '{\n  "name": "Isaac",\n  "role": "Developer",\n  "active": true,\n  "tags": ["js", "ts"]\n}',
    right: '{\n  "name": "Isaac K.",\n  "role": "Senior Developer",\n  "active": true,\n  "tags": ["js", "ts", "react"]\n}',
  });

  const [error, setError] = useState<string | null>(null);

  const delta = useMemo(() => {
    if (!hydrated) return null;
    try {
      const leftObj = JSON.parse(state.left);
      const rightObj = JSON.parse(state.right);
      setError(null);
      return jsondiffpatch.diff(leftObj, rightObj);
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [state, hydrated]);

  const clearAll = () => {
    setState({ left: "", right: "" });
  };

  const loadSample = () => {
    setState({
      left: '{\n  "id": 1,\n  "status": "pending",\n  "items": [1, 2, 3]\n}',
      right: '{\n  "id": 1,\n  "status": "completed",\n  "items": [1, 2, 4]\n}',
    });
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">JSON Diff</h2>
          <p className="text-sm text-text-sub mt-1">Compare two JSON objects and visualize the differences instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadSample}
            className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light bg-white border border-primary/20 rounded-lg transition-smooth cursor-pointer"
          >
            Load Sample
          </button>
          <button 
            onClick={clearAll}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-white border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
         {/* Left Side */}
         <div className="bg-white rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-amber" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Original JSON (Left)</span>
              </div>
            </div>
            <textarea
              value={state.left}
              onChange={(e) => setState(prev => ({ ...prev, left: e.target.value }))}
              placeholder="Paste original JSON here..."
              className="flex-1 p-5 font-code text-[13px] text-text bg-transparent resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
         </div>

         {/* Right Side */}
         <div className="bg-white rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-teal" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Modified JSON (Right)</span>
              </div>
            </div>
            <textarea
              value={state.right}
              onChange={(e) => setState(prev => ({ ...prev, right: e.target.value }))}
              placeholder="Paste modified JSON here..."
              className="flex-1 p-5 font-code text-[13px] text-text bg-transparent resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
         </div>
      </div>

      {error ? (
        <div className="p-6 bg-accent-red/5 border border-accent-red/20 rounded-xl flex items-center gap-3 animate-in">
           <span className="material-symbols-outlined text-accent-red">error</span>
           <span className="text-sm font-bold text-accent-red tracking-tight">{error}</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-float overflow-hidden flex flex-col min-h-[300px]">
           <div className="px-6 py-4 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-text-dim">Difference Visualization</span>
              </div>
              {!delta && <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">No differences found</span>}
           </div>
           <div className="p-8 overflow-auto bg-surface-raised/10">
              {delta ? (
                <pre className="font-code text-sm leading-relaxed whitespace-pre">
                   {JSON.stringify(delta, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-30 select-none">
                   <span className="material-symbols-outlined text-[48px] mb-4">check_circle</span>
                   <p className="font-bold uppercase tracking-[0.2em] text-xs">Objects are Identical</p>
                </div>
              )}
           </div>
           <div className="px-6 py-3 border-t border-border bg-surface-raised/50">
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">
                * Visualization uses JSONDelta format. Added/Modified values are highlighted in the logic.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
