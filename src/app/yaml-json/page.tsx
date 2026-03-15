"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback, useMemo } from "react";
import yaml from "js-yaml";

interface State {
  input: string;
  mode: "yaml-to-json" | "json-to-yaml";
}

export default function YamlJsonPage() {
  const [state, setState, hydrated] = useLocalStorage<State>("yaml_json_state", {
    input: "id: 101\nname: Isaac K.\nroles:\n  - admin\n  - developer\nactive: true",
    mode: "yaml-to-json",
  });

  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!state.input || !hydrated) return "";
    try {
      if (state.mode === "yaml-to-json") {
        const doc = yaml.load(state.input);
        return JSON.stringify(doc, null, 2);
      } else {
        const doc = JSON.parse(state.input);
        return yaml.dump(doc, { indent: 2, lineWidth: -1 });
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

  const swapValue = () => {
    if (output.startsWith("Error")) return;
    setState(prev => ({
      input: output,
      mode: prev.mode === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json"
    }));
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">YAML / JSON Converter</h2>
          <p className="text-sm text-text-sub mt-1">Easily convert between YAML and JSON formats for configuration files.</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setState(prev => ({ ...prev, input: "" }))}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-white border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
           <button 
            onClick={swapValue}
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
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">
                  {state.mode === 'yaml-to-json' ? 'Source YAML' : 'Source JSON'}
                </span>
              </div>
              <div className="flex bg-surface-raised p-1 rounded-lg gap-1">
                 {(["yaml-to-json", "json-to-yaml"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setState(prev => ({ ...prev, mode: m }))}
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-smooth cursor-pointer ${
                        state.mode === m ? "bg-white text-primary shadow-sm" : "text-text-dim hover:text-text-sub"
                      }`}
                    >
                      {m.split('-').join(' ')}
                    </button>
                 ))}
              </div>
            </div>
            <textarea
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              placeholder={`Paste your ${state.mode === 'yaml-to-json' ? 'YAML' : 'JSON'} here...`}
              className="flex-1 p-6 font-code text-text bg-transparent resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
         </div>

         <div className="bg-white rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-green" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">
                  {state.mode === 'yaml-to-json' ? 'Result JSON' : 'Result YAML'}
                </span>
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
               <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">
                  {output.length} Characters
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
