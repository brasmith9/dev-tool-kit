"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useMemo } from "react";
import yaml from "js-yaml";
import { JsonTree } from "@/components/JsonTree";
import { ValidatedTextarea } from "@/components/ValidatedTextarea";
import { validateYaml, validateJson, ValidationError } from "@/utils/validation";

interface State {
  input: string;
  mode: "yaml-to-json" | "json-to-yaml";
}

export default function YamlJsonPage() {
  const [state, setState, hydrated] = useLocalStorage<State>("yaml_json_state", {
    input: "id: 101\nname: Isaac K.\nroles:\n  - admin\n  - developer\nactive: true",
    mode: "yaml-to-json",
  });

  const [viewMode, setViewMode] = useState<"raw" | "tree">("tree");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);

  const result = useMemo(() => {
    if (!state.input || !hydrated) return { text: "", data: null };
    try {
      if (state.mode === "yaml-to-json") {
        const err = validateYaml(state.input);
        if (err) {
          setError(err);
          return { text: `Error: ${err.message}`, data: null };
        }
        const doc = yaml.load(state.input);
        setError(null);
        return { text: JSON.stringify(doc, null, 2), data: doc };
      } else {
        const err = validateJson(state.input);
        if (err) {
          setError(err);
          return { text: `Error: ${err.message}`, data: null };
        }
        const doc = JSON.parse(state.input);
        setError(null);
        return { text: yaml.dump(doc, { indent: 2, lineWidth: -1 }), data: doc };
      }
    } catch (e: any) {
      setError({ message: e.message, line: 1, column: 1 });
      return { text: `Error: ${e.message}`, data: null };
    }
  }, [state, hydrated]);

  const output = result.text;

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">YAML / JSON Converter</h2>
          <p className="text-sm text-text-sub mt-1">Easily convert between YAML and JSON formats for configuration files.</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
            type="button"
            onClick={() => setState(prev => ({ ...prev, input: "" }))}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
           <button 
            type="button"
            onClick={swapValue}
            className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>Swap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[calc(100vh-190px)]">
         {/* Input Section */}
         <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden min-h-[300px] lg:h-full">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
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
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, mode: m }))}
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-smooth cursor-pointer ${
                        state.mode === m ? "bg-surface text-primary shadow-sm" : "text-text-dim hover:text-text-sub"
                      }`}
                    >
                      {m === "yaml-to-json" ? "YML to JS" : "JS to YML"}
                    </button>
                 ))}
              </div>
            </div>
            <ValidatedTextarea
              value={state.input}
              onChange={(val) => setState(prev => ({ ...prev, input: val }))}
              error={error}
              placeholder={`Paste your ${state.mode === 'yaml-to-json' ? 'YAML' : 'JSON'} here...`}
              className="flex-1"
            />
            {error && (
              <div className="mx-4 mb-4 p-3 bg-accent-red/5 border border-accent-red/10 rounded-lg flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                <span className="material-symbols-outlined text-accent-red text-[18px] shrink-0">error</span>
                <div className="flex flex-col">
                  <p className="text-[11px] font-bold text-accent-red uppercase tracking-widest mb-0.5">Error at Line {error.line}, Col {error.column}</p>
                  <p className="text-[11px] font-medium text-accent-red/80 leading-normal">{error.message}</p>
                </div>
              </div>
            )}
         </div>

         {/* Output Section */}
         <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden min-h-[300px] lg:h-full">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-green" />
                {state.mode === 'yaml-to-json' ? (
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
                ) : (
                  <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Result YAML</span>
                )}
              </div>
              <button 
                type="button"
                onClick={copyToClipboard}
                className="size-7 rounded-lg flex items-center justify-center text-text-dim hover:text-primary hover:bg-primary-light transition-smooth cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto bg-surface-raised/30 selection:bg-primary-light/30">
               {!output && (
                 <span className="text-text-dim/50 italic select-none">Output will appear here...</span>
               )}
               {output && state.mode === "yaml-to-json" && viewMode === "tree" && result.data && (
                  <div className="font-code text-text-sub">
                    <JsonTree data={result.data} />
                  </div>
               )}
               {output && (state.mode !== "yaml-to-json" || viewMode !== "tree" || !result.data) && (
                  <pre className="font-code text-text-sub whitespace-pre-wrap break-all leading-relaxed">
                    {output}
                  </pre>
               )}
            </div>
            <div className="px-5 py-3 bg-surface-raised/50 border-t border-border flex items-center justify-between">
               <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest leading-none">
                  {output.length} Chars
               </span>
               <button 
                type="button"
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
