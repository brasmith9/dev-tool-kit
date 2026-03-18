"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState, useCallback, useEffect } from "react";

interface Config {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export default function PasswordGeneratorPage() {
  const [config, setConfig, hydrated] = useLocalStorage<Config>("pass_gen_config", {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    const chars = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    };

    let charset = "";
    if (config.uppercase) charset += chars.uppercase;
    if (config.lowercase) charset += chars.lowercase;
    if (config.numbers) charset += chars.numbers;
    if (config.symbols) charset += chars.symbols;

    if (!charset) {
      setPassword("Select at least one option");
      return;
    }

    let result = "";
    const array = new Uint32Array(config.length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < config.length; i++) {
      result += charset[array[i] % charset.length];
    }
    setPassword(result);
  }, [config]);

  useEffect(() => {
    if (hydrated && !password) generatePassword();
  }, [hydrated, generatePassword, password]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    let score = 0;
    if (config.length >= 12) score++;
    if (config.length >= 16) score++;
    if (config.uppercase) score++;
    if (config.lowercase) score++;
    if (config.numbers) score++;
    if (config.symbols) score++;
    
    if (score <= 2) return { label: "Weak", color: "bg-accent-red" };
    if (score <= 4) return { label: "Fair", color: "bg-accent-amber" };
    if (score <= 6) return { label: "Strong", color: "bg-accent-green" };
    return { label: "Maximum", color: "bg-primary" };
  };

  if (!hydrated) return null;

  return (
    <div className="animate-in flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Password Generator</h2>
          <p className="text-sm text-text-sub mt-1">Generate highly secure, cryptographically random passwords.</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={generatePassword}
            className="px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-card hover:bg-primary-hover transition-smooth flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">cached</span>
            Regenerate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface rounded-2xl border border-border shadow-float p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`flex-1 h-full transition-smooth ${i <= (getStrength().label === 'Weak' ? 1 : getStrength().label === 'Fair' ? 2 : getStrength().label === 'Strong' ? 4 : 5) ? getStrength().color : 'bg-surface-raised'}`} />
                  ))}
               </div>
               
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-6">Generated Result</span>
               
               <div className="w-full flex items-center justify-center gap-4 mb-8">
                  <span className="text-2xl md:text-4xl font-code font-black text-text break-all tracking-wider tabular-nums select-all">
                    {password}
                  </span>
                  <button 
                    onClick={copyToClipboard}
                    className="size-12 rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-smooth cursor-pointer shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-[24px] group-active:scale-90 transition-smooth">
                      {copied ? "check" : "content_copy"}
                    </span>
                  </button>
               </div>

               <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-raised rounded-full border border-border">
                  <div className={`size-2 rounded-full ${getStrength().color}`} />
                  <span className="text-[11px] font-bold text-text-sub uppercase tracking-widest">{getStrength().label} Entropy</span>
               </div>
            </div>

            <div className="bg-surface rounded-xl border border-border shadow-card p-8">
               <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim mb-8 flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px]">tune</span>
                 Customization
               </h3>

               <div className="space-y-10">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[13px] font-bold text-text-sub uppercase tracking-wider">Password Length</span>
                        <span className="px-2 py-1 bg-primary-light text-primary font-black rounded text-xs">{config.length}</span>
                     </div>
                     <input 
                       type="range"
                       min="4"
                       max="64"
                       value={config.length}
                       onChange={(e) => setConfig(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                       className="w-full accent-primary"
                     />
                     <div className="flex justify-between text-[10px] font-bold text-text-dim/40 uppercase">
                        <span>4</span>
                        <span>16</span>
                        <span>32</span>
                        <span>48</span>
                        <span>64</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[
                       { id: 'uppercase' as const, label: 'ABC' },
                       { id: 'lowercase' as const, label: 'abc' },
                       { id: 'numbers' as const, label: '123' },
                       { id: 'symbols' as const, label: '#@!' },
                     ].map(item => (
                       <button
                         key={item.id}
                         onClick={() => setConfig(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                         className={`p-4 rounded-xl border font-black text-xs transition-smooth hover:shadow-sm ${
                           config[item.id] ? "bg-primary text-white border-primary shadow-card" : "bg-surface text-text-dim border-border hover:border-text-dim"
                         }`}
                       >
                         {item.label}
                       </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface rounded-xl border border-border shadow-card p-6 space-y-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">security</span>
                  Safety Note
               </h3>
               <p className="text-[11px] font-medium text-text-sub leading-relaxed">
                  We use <code className="text-primary font-bold">window.crypto.getRandomValues</code> for true cryptographic randomness. 
                  Unlike standard random functions, this is safe for generating sensitive passwords and keys.
               </p>
               <div className="pt-2">
                  <div className="p-3 bg-primary-light/50 rounded-lg border border-primary/10">
                     <p className="text-[10px] font-bold text-primary italic leading-normal">
                       "A 16-character password with symbols has more combinations than there are atoms in the known universe."
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
