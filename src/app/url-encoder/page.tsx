"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback, useMemo } from "react";

interface State {
  input: string;
  mode: "encode" | "decode";
  doubleAction: boolean;
}

export default function UrlEncoderPage() {
  const [state, setState, hydrated] = useLocalStorage<State>("url_encoder_state", {
    input: "https://example.com/search?q=hello world & more!",
    mode: "encode",
    doubleAction: false,
  });

  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!state.input || !hydrated) return "";
    try {
      let result = state.input;
      if (state.mode === "encode") {
        result = encodeURIComponent(result);
        if (state.doubleAction) result = encodeURIComponent(result);
      } else {
        result = decodeURIComponent(result);
        if (state.doubleAction) result = decodeURIComponent(result);
      }
      return result;
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
      input: output, 
      mode: prev.mode === "encode" ? "decode" : "encode" 
    }));
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">URL Encoder / Decoder</h2>
          <p className="text-sm text-text-sub mt-1">Safely encode and decode strings for use in URLs.</p>
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
         {/* Input Section */}
         <div className="bg-white rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-amber pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Source Content</span>
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
            <div className="px-5 py-3 bg-surface-raised/50 border-t border-border flex items-center gap-4">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-[11px] font-bold text-text-dim uppercase group-hover:text-text-sub transition-smooth">Double {state.mode === 'encode' ? 'Encoding' : 'Decoding'}</span>
                   <button 
                    onClick={() => setState(prev => ({ ...prev, doubleAction: !prev.doubleAction }))}
                    className={`w-8 h-4.5 rounded-full transition-smooth relative ${state.doubleAction ? "bg-primary" : "bg-border-strong"}`}
                  >
                    <div className={`absolute top-0.5 size-3.5 rounded-full bg-white transition-smooth ${state.doubleAction ? "left-4" : "left-0.5"}`} />
                  </button>
               </label>
            </div>
         </div>

         {/* Output Section */}
         <div className="bg-white rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-green" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Result</span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="size-7 rounded-lg flex items-center justify-center text-text-dim hover:text-primary hover:bg-primary-light transition-smooth cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto bg-surface-raised/30">
               <pre className="font-code text-text-sub whitespace-pre-wrap break-all leading-relaxed">
                  {output || <span className="text-text-dim/50 italic select-none">Output will appear here...</span>}
               </pre>
            </div>
            <div className="px-5 py-3 bg-surface-raised/50 border-t border-border flex items-center justify-between">
               <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest line-clamp-1 max-w-[200px]">
                  {output.startsWith('Error') ? 'Formatting Error' : `${state.input.length} → ${output.length} Chars`}
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
