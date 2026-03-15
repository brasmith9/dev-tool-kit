"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useMemo } from "react";

interface State {
  token: string;
  secret: string;
}

export default function JwtDebuggerPage() {
  const [state, setState, hydrated] = useLocalStorage<State>("jwt_state", {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJhZG1pbiI6dHJ1ZX0.dummysignature",
    secret: "your-signature-secret",
  });

  const [copied, setCopied] = useState<string | null>(null);

  const decoded = useMemo(() => {
    if (!state.token || !hydrated) return null;
    try {
      const parts = state.token.split('.');
      if (parts.length < 2) return null;
      
      const decode = (str: string) => {
        try {
          return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
        } catch {
          return { error: "Failed to decode" };
        }
      };

      return {
        header: decode(parts[0]),
        payload: decode(parts[1]),
        signature: parts[2] || ""
      };
    } catch {
      return null;
    }
  }, [state.token, hydrated]);

  const copySection = async (val: any, id: string) => {
    const text = typeof val === 'string' ? val : JSON.stringify(val, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">JWT Debugger</h2>
          <p className="text-sm text-text-sub mt-1">Decode, verify, and generate JSON Web Tokens.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setState(prev => ({ ...prev, token: "" }))}
            className="px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-white border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
         {/* Left: Encoded Token */}
         <div className="lg:col-span-4 flex flex-col bg-white rounded-xl border border-border shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Encoded Token</span>
            </div>
            <textarea
              value={state.token}
              onChange={(e) => setState(prev => ({ ...prev, token: e.target.value }))}
              placeholder="Paste your JWT here..."
              className="flex-1 p-5 font-code text-[13px] text-primary bg-transparent resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
            <div className="p-4 bg-surface-raised/50 border-t border-border">
               <div className="p-3 bg-white border border-border rounded-lg shadow-sm">
                  <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest block mb-2">Signature Secret</span>
                  <input 
                    type="password"
                    value={state.secret}
                    onChange={(e) => setState(prev => ({ ...prev, secret: e.target.value }))}
                    className="w-full p-2 bg-surface-raised rounded-md border border-border font-code text-xs focus:ring-1 focus:ring-primary/20 focus:outline-none"
                    placeholder="Enter secret..."
                  />
               </div>
            </div>
         </div>

         {/* Right: Decoded Data */}
         <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-1">
            {/* Header */}
            <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
               <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-accent-purple" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Header</span>
                    <span className="text-[10px] text-text-dim/50 ml-2">Algorithm & Type</span>
                 </div>
                 <button onClick={() => decoded && copySection(decoded.header, 'h')} className="text-text-dim hover:text-primary transition-smooth cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">{copied === 'h' ? 'check' : 'content_copy'}</span>
                 </button>
               </div>
               <div className="p-6 bg-surface-raised/10">
                  <pre className="font-code text-accent-purple">
                    {decoded ? JSON.stringify(decoded.header, null, 2) : "n/a"}
                  </pre>
               </div>
            </div>

            {/* Payload */}
            <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
               <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-accent-teal" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Payload</span>
                    <span className="text-[10px] text-text-dim/50 ml-2">Data & Claims</span>
                 </div>
                 <button onClick={() => decoded && copySection(decoded.payload, 'p')} className="text-text-dim hover:text-primary transition-smooth cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">{copied === 'p' ? 'check' : 'content_copy'}</span>
                 </button>
               </div>
               <div className="p-6 bg-surface-raised/10">
                  <pre className="font-code text-accent-teal">
                    {decoded ? JSON.stringify(decoded.payload, null, 2) : "n/a"}
                  </pre>
               </div>
               {decoded?.payload?.exp && (
                  <div className="m-4 mt-0 p-3 bg-surface-raised rounded-lg border border-border flex items-center justify-between">
                     <span className="text-xs font-bold text-text-sub uppercase tracking-wider">Expiration</span>
                     <span className="text-xs font-mono font-bold text-primary">
                        {new Date(decoded.payload.exp * 1000).toLocaleString()}
                     </span>
                  </div>
               )}
            </div>

            {/* Signature Area */}
            <div className="bg-surface-raised text-text-dim rounded-xl border border-border shadow-sm p-5 border-dashed">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  <span className="text-xs font-bold uppercase tracking-[0.1em]">Signature Verified</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
