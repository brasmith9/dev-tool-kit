"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback, useMemo } from "react";
import { format } from "sql-formatter";

interface Config {
  language: string;
  uppercase: boolean;
  indent: number;
}

export default function SqlFormatterPage() {
  const [input, setInput, hydratedInput] = useLocalStorage<string>("sql_input", "SELECT * FROM users WHERE id = 1 AND status = 'active' ORDER BY created_at DESC;");
  const [config, setConfig, hydratedConfig] = useLocalStorage<Config>("sql_config", {
    language: "sql",
    uppercase: true,
    indent: 2,
  });

  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input || !hydratedInput) return "";
    try {
      return format(input, {
        language: config.language as any,
        keywordCase: config.uppercase ? "upper" : "preserve",
        tabWidth: config.indent,
      });
    } catch (e) {
      return `Error: ${(e as Error).message}`;
    }
  }, [input, config, hydratedInput]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hydratedInput || !hydratedConfig) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">SQL Formatter</h2>
          <p className="text-sm text-text-sub mt-1">Beautify and format complex SQL queries for better readability.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setInput("")}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-190px)]">
         <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-amber pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Raw Query</span>
              </div>
              <div className="flex items-center gap-3">
                 <select 
                   value={config.language}
                   onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value }))}
                   className="text-[11px] font-bold text-text-dim bg-transparent border-none cursor-pointer hover:text-text-sub focus:ring-0"
                 >
                   <option value="sql">Standard SQL</option>
                   <option value="postgresql">PostgreSQL</option>
                   <option value="mysql">MySQL</option>
                   <option value="tsql">T-SQL (SQL Server)</option>
                   <option value="sqlite">SQLite</option>
                 </select>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your messy SQL query here..."
              className="flex-1 p-6 font-code text-text bg-transparent resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
            <div className="px-5 py-3 bg-surface-raised/50 border-t border-border flex items-center gap-6">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-[11px] font-bold text-text-dim uppercase">UPPERCASE Keywords</span>
                  <button 
                    onClick={() => setConfig(prev => ({ ...prev, uppercase: !prev.uppercase }))}
                    className={`w-8 h-4.5 rounded-full transition-smooth relative ${config.uppercase ? "bg-primary" : "bg-border-strong"}`}
                  >
                    <div className={`absolute top-0.5 size-3.5 rounded-full bg-surface transition-smooth ${config.uppercase ? "left-4" : "left-0.5"}`} />
                  </button>
               </label>
            </div>
         </div>

         <div className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-accent-green" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Formatted Query</span>
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
                  {output.split('\n').length} Lines
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
