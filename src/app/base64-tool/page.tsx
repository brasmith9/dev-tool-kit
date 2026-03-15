"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback, useMemo } from "react";

interface State {
  input: string;
  mode: "encode" | "decode";
  urlSafe: boolean;
}

export default function Base64ToolPage() {
  const [state, setState, hydrated] = useLocalStorage<State>("base64_state", {
    input: "DevToolkit is awesome!",
    mode: "encode",
    urlSafe: false,
  });

  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!state.input || !hydrated) return "";
    try {
      if (state.mode === "encode") {
        let res = btoa(unescape(encodeURIComponent(state.input)));
        if (state.urlSafe) {
          res = res.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }
        return res;
      } else {
        let inputStr = state.input;
        if (state.urlSafe) {
          inputStr = inputStr.replace(/-/g, "+").replace(/_/g, "/");
          while (inputStr.length % 4) inputStr += "=";
        }
        return decodeURIComponent(escape(atob(inputStr)));
      }
    } catch (e) {
      return `Error: ${(e as Error).message}`;
    }
  }, [state, hydrated]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swap = () => {
    setState(prev => ({ 
      ...prev, 
      input: output.startsWith('Error') ? prev.input : output, 
      mode: prev.mode === "encode" ? "decode" : "encode" 
    }));
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Base64 Encoder / Decoder</h2>
          <p className="text-sm text-text-sub mt-1">Convert strings to Base64 and back with URL-safe options.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setState(prev => ({ ...prev, input: "" }))}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-white border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
          <button 
            onClick={swap}
            className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            Swap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-190px)]">
         <div className="bg-white rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-amber pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Input</span>
              </div>
              <div className="flex bg-surface-raised p-1 rounded-lg gap-1">
                 {(["encode", "decode"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setState(prev => ({ ...prev, mode: m }))}
                      className={`px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-smooth cursor-pointer ${
                        state.mode === m ? "bg-white text-primary shadow-sm" : "text-text-dim hover:text-text-sub"
                      }`}
                    >
                      {m}
                    </button>
                 ))}
              </div>
            </div>
            <textarea
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              placeholder={`Enter text to ${state.mode}...`}
              className="flex-1 p-6 font-code text-text bg-transparent resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
            <div className="px-5 py-3 bg-surface-raised/50 border-t border-border">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-[11px] font-bold text-text-dim uppercase group-hover:text-text-sub transition-smooth">URL Safe</span>
                   <button 
                    onClick={() => setState(prev => ({ ...prev, urlSafe: !prev.urlSafe }))}
                    className={`w-8 h-4.5 rounded-full transition-smooth relative ${state.urlSafe ? "bg-primary" : "bg-border-strong"}`}
                  >
                    <div className={`absolute top-0.5 size-3.5 rounded-full bg-white transition-smooth ${state.urlSafe ? "left-4" : "left-0.5"}`} />
                  </button>
               </label>
            </div>
         </div>

         <div className="bg-white rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-green" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Result</span>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto bg-surface-raised/30">
               <pre className="font-code text-text-sub whitespace-pre-wrap break-all leading-relaxed">
                  {output || <span className="text-text-dim/50 italic select-none">Output will appear here...</span>}
               </pre>
            </div>
            <div className="px-5 py-3 bg-surface-raised/50 border-t border-border flex items-center justify-between">
               <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">
                  {state.input.length} Chars → {output.length} Chars
               </span>
               <button 
                onClick={copyToClipboard}
                className="px-4 py-1.5 text-[11px] font-bold text-white bg-primary rounded shadow-sm hover:bg-primary-hover transition-smooth cursor-pointer"
              >
                {copied ? "Copied" : "Copy Result"}
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}
