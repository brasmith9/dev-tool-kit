"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useMemo } from "react";
import * as jsondiffpatch from "jsondiffpatch";
import { JsonTree } from "@/components/JsonTree";

interface DiffState {
  json1: string;
  json2: string;
}

export default function JsonDiffPage() {
  const [state, setState, hydrated] = useLocalStorage<DiffState>("json_diff_state", {
    json1: '{\n  "name": "Isaac",\n  "role": "admin",\n  "active": true\n}',
    json2: '{\n  "name": "Isaac",\n  "role": "editor",\n  "active": false,\n  "lastLogin": "2024-01-01"\n}',
  });

  const [viewMode, setViewMode] = useState<"raw" | "tree">("tree");

  const delta = useMemo(() => {
    if (!state.json1 || !state.json2 || !hydrated) return null;
    try {
      const obj1 = JSON.parse(state.json1);
      const obj2 = JSON.parse(state.json2);
      return jsondiffpatch.diff(obj1, obj2);
    } catch {
      return null;
    }
  }, [state, hydrated]);

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">JSON Diff</h2>
          <p className="text-sm text-text-sub mt-1">Compare two JSON objects and visualize the differences.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setState({ json1: "", json2: "" })}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
          <button 
            type="button"
            onClick={() => {
              setState(prev => ({ json1: prev.json2, json2: prev.json1 }));
            }}
            className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center justify-center gap-2 cursor-pointer"
          >
             <span className="material-symbols-outlined text-[18px]">swap_horiz</span>Swap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[calc(100vh-190px)]">
        {/* Editors Section */}
        <div className="flex flex-col gap-4 h-full min-h-[500px] lg:min-h-0">
          <div className="flex-1 bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden min-h-[240px]">
            <div className="px-5 py-2.5 border-b border-border bg-surface/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Original JSON (Left)</span>
            </div>
            <textarea
              value={state.json1}
              onChange={(e) => setState(prev => ({ ...prev, json1: e.target.value }))}
              placeholder="Paste first JSON here..."
              className="flex-1 p-5 font-code text-text bg-transparent resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
          <div className="flex-1 bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden min-h-[240px]">
            <div className="px-5 py-2.5 border-b border-border bg-surface/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Modified JSON (Right)</span>
            </div>
            <textarea
              value={state.json2}
              onChange={(e) => setState(prev => ({ ...prev, json2: e.target.value }))}
              placeholder="Paste second JSON here..."
              className="flex-1 p-5 font-code text-text bg-transparent resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Diff Result Section */}
        <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden h-full min-h-[400px]">
          <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-text-dim leading-none">Difference Visualization</span>
              <div className="flex bg-surface-raised rounded-lg p-0.5 border border-border scale-90 origin-left">
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
            </div>
          </div>
          <div className="flex-1 p-8 overflow-auto bg-surface-raised/10 selection:bg-primary-light/30">
            {!delta && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-30 select-none">
                <span className="material-symbols-outlined text-[48px] mb-4">compare</span>
                <p className="text-sm font-bold uppercase tracking-wider max-w-[200px]">Compare valid JSON objects to see their deltas</p>
              </div>
            )}
            
            {delta && viewMode === "tree" && (
              <div className="font-code text-text-sub">
                <JsonTree data={delta} />
              </div>
            )}
            
            {delta && viewMode !== "tree" && (
              <pre className="font-code text-text-sub whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(delta, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
