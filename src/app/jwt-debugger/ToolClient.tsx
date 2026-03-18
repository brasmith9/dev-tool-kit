"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useMemo, useEffect } from "react";
import { ValidatedTextarea } from "@/components/ValidatedTextarea";
import { validateJson, ValidationError } from "@/utils/validation";
import { base64UrlEncode, base64UrlDecode, signJwt, verifyJwt } from "@/utils/jwt";

interface State {
  token: string;
  secret: string;
}

export default function JwtDebuggerPage() {
  const [state, setState, hydrated] = useLocalStorage<State>("jwt_state", {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJhZG1pbiI6dHJ1ZX0.dummysignature",
    secret: "your-signature-secret",
  });

  const [headerStr, setHeaderStr] = useState("");
  const [payloadStr, setPayloadStr] = useState("");
  const [headerErr, setHeaderErr] = useState<ValidationError | null>(null);
  const [payloadErr, setPayloadErr] = useState<ValidationError | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isValidSignature, setIsValidSignature] = useState(false);

  // Sync state.token to headerStr and payloadStr (only if token is modified directly)
  useEffect(() => {
     if (!hydrated || !state.token) return;
     const parts = state.token.split('.');
     if (parts.length >= 2) {
        try {
           const h = base64UrlDecode(parts[0]);
           const p = base64UrlDecode(parts[1]);
           setHeaderStr(JSON.stringify(JSON.parse(h), null, 2));
           setPayloadStr(JSON.stringify(JSON.parse(p), null, 2));
           setHeaderErr(null);
           setPayloadErr(null);
        } catch {
           // If we can't decode, just leave state as is
        }
     }
  }, [state.token, hydrated]);

  // Verify signature when secret or token changes
  useEffect(() => {
    if (state.token && state.secret) {
       setIsValidSignature(verifyJwt(state.token, state.secret));
    } else {
       setIsValidSignature(false);
    }
  }, [state.token, state.secret]);

  const updateTokenFromParts = (h: string, p: string, s: string) => {
    try {
       // Validate JSON first
       const hErr = validateJson(h);
       const pErr = validateJson(p);
       setHeaderErr(hErr);
       setPayloadErr(pErr);
       
       if (!hErr && !pErr) {
          const newToken = signJwt(h, p, s);
          setState(prev => ({ ...prev, token: newToken }));
       }
    } catch {
       // Ignore errors during typing
    }
  };

  const copySection = async (val: string, id: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const expirationDate = useMemo(() => {
    try {
      const p = JSON.parse(payloadStr);
      if (p.exp) return new Date(p.exp * 1000).toLocaleString();
    } catch {}
    return null;
  }, [payloadStr]);

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6 tool-container">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 tool-header">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">JWT Tool</h2>
          <p className="text-sm text-text-sub mt-1">Encode (Generate), Decode (Debug), and Verify JWTs instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setState(prev => ({ ...prev, token: "" }))}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-text-sub hover:text-text bg-surface border border-border rounded-lg transition-smooth hover:bg-surface-raised cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-190px)]">
         {/* Left: Encoded Token */}
         <div className="lg:col-span-5 flex flex-col bg-surface rounded-xl border border-border shadow-card overflow-hidden min-h-[400px] lg:h-full">
            <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Encoded Token (Output/Input)</span>
              <button 
                type="button"
                onClick={() => copySection(state.token, 'token')}
                className="text-text-dim hover:text-primary transition-smooth"
              >
                 <span className="material-symbols-outlined text-[18px]">{copied === 'token' ? 'check' : 'content_copy'}</span>
              </button>
            </div>
            <textarea
              value={state.token}
              onChange={(e) => setState(prev => ({ ...prev, token: e.target.value }))}
              placeholder="Paste your JWT here..."
              className="flex-1 p-5 font-code text-[14px] text-primary bg-transparent resize-none focus:outline-none leading-relaxed whitespace-pre-wrap break-all selection:bg-primary-light/50"
              spellCheck={false}
            />
            
            <div className="p-4 bg-surface-raised/50 border-t border-border shrink-0">
               <div className="p-3 bg-surface border border-border rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest block mb-2">Signature Secret (HS256)</span>
                  <input 
                    type="password"
                    value={state.secret}
                    onChange={(e) => {
                      const s = e.target.value;
                      setState(prev => ({ ...prev, secret: s }));
                      updateTokenFromParts(headerStr, payloadStr, s);
                    }}
                    className="w-full p-2.5 bg-surface-raised rounded-lg border border-border font-code text-xs focus:ring-2 focus:ring-primary/10 focus:outline-none transition-smooth"
                    placeholder="Enter secret for signing..."
                  />
                  <div className={`mt-2 flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${isValidSignature ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                     <span className="material-symbols-outlined text-[14px]">{isValidSignature ? 'verified_user' : 'error'}</span>
                     {isValidSignature ? 'Signature Verified' : 'Invalid Signature'}
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Decoded Data (Editable for Generator) */}
         <div className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto lg:h-full pr-1 pb-6 lg:pb-0">
            {/* Header */}
            <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden shrink-0">
               <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-accent-purple" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Header</span>
                    <span className="text-[10px] text-text-dim/50 ml-2">Algorithm & Type</span>
                 </div>
                 <button 
                  type="button"
                  onClick={() => copySection(headerStr, 'h')} 
                  className="text-text-dim hover:text-primary transition-smooth cursor-pointer"
                 >
                    <span className="material-symbols-outlined text-[18px]">{copied === 'h' ? 'check' : 'content_copy'}</span>
                 </button>
               </div>
               <div className="h-48 overflow-hidden">
                  <ValidatedTextarea
                    value={headerStr}
                    onChange={(val) => {
                      setHeaderStr(val);
                      updateTokenFromParts(val, payloadStr, state.secret);
                    }}
                    error={headerErr}
                    placeholder='{"alg": "HS256", "typ": "JWT"}'
                    className="h-full"
                  />
               </div>
            </div>

            {/* Payload */}
            <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden flex flex-col shrink-0">
               <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-accent-teal" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Payload</span>
                    <span className="text-[10px] text-text-dim/50 ml-2">Data & Claims</span>
                 </div>
                 <button 
                  type="button"
                  onClick={() => copySection(payloadStr, 'p')} 
                  className="text-text-dim hover:text-primary transition-smooth cursor-pointer"
                 >
                    <span className="material-symbols-outlined text-[18px]">{copied === 'p' ? 'check' : 'content_copy'}</span>
                 </button>
               </div>
               <div className="h-64 overflow-hidden">
                  <ValidatedTextarea
                    value={payloadStr}
                    onChange={(val) => {
                      setPayloadStr(val);
                      updateTokenFromParts(headerStr, val, state.secret);
                    }}
                    error={payloadErr}
                    placeholder='{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}'
                    className="h-full"
                  />
               </div>
               {expirationDate && (
                  <div className="m-4 mt-0 p-3 bg-accent-teal/5 rounded-lg border border-accent-teal/10 flex items-center justify-between animate-in fade-in">
                     <span className="text-[10px] font-bold text-accent-teal uppercase tracking-widest">Expiration (exp)</span>
                     <span className="text-[11px] font-bold text-text-sub">
                        {expirationDate}
                     </span>
                  </div>
               )}
            </div>

            {/* Info Message */}
            <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
               <span className="material-symbols-outlined text-primary">info</span>
               <div className="flex flex-col">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">How it works</p>
                  <p className="text-[11px] text-primary/70 font-medium leading-relaxed">
                     Edit any field on the right (Header, Payload, or Secret) to instantly generate a new signed token on the left. 
                     The signature is automatically verified using the provided secret (HS256).
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
