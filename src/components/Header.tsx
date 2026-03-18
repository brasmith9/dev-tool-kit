"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

const routeMeta: Record<string, { icon: string; label: string }> = {
  "/": { icon: "space_dashboard", label: "Dashboard" },
  "/guid-generator": { icon: "fingerprint", label: "GUID Generator" },
  "/json-formatter": { icon: "data_object", label: "JSON Formatter" },
  "/json-to-code": { icon: "code", label: "JSON to Code" },
  "/json-diff": { icon: "difference", label: "JSON Diff" },
  "/ip-calculator": { icon: "lan", label: "IP Calculator" },
  "/curl-converter": { icon: "transform", label: "cURL Converter" },
  "/http-inspector": { icon: "rebase_edit", label: "HTTP Inspector" },
  "/base64-tool": { icon: "code", label: "Base64 Tool" },
  "/jwt-debugger": { icon: "vpn_key", label: "JWT Tool" },
  "/regex-tester": { icon: "manage_search", label: "Regex Tester" },
  "/hash-generator": { icon: "enhanced_encryption", label: "Hash Generator" },
  "/url-encoder": { icon: "link", label: "URL Encoder" },
  "/epoch-converter": { icon: "schedule", label: "Epoch Converter" },
  "/sql-formatter": { icon: "database", label: "SQL Formatter" },
  "/cron-parser": { icon: "event_repeat", label: "Cron Parser" },
  "/yaml-json": { icon: "schema", label: "YAML / JSON" },
  "/password-generator": { icon: "password", label: "Password Gen" },
  "/kafka-visualizer": { icon: "hub", label: "Kafka Visualizer" },
  "/redis-lab": { icon: "memory", label: "Redis Cache Lab" },
  "/load-balancer": { icon: "architecture", label: "Load Balancer" },
  "/settings": { icon: "settings", label: "Settings" },
};

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const meta = routeMeta[pathname] || { icon: "terminal", label: "Tool" };

  const filteredTools = search.length > 0 
    ? Object.entries(routeMeta).filter(([p, m]) => 
        m.label.toLowerCase().includes(search.toLowerCase()) && p !== "/"
      )
    : [];

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowResults(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    globalThis.document?.addEventListener("keydown", handleKeyDown);
    globalThis.document?.addEventListener("mousedown", handleClickOutside);
    return () => {
      globalThis.document?.removeEventListener("keydown", handleKeyDown);
      globalThis.document?.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <header className="flex justify-between items-center pb-4 select-none relative z-50 gap-4">
      <div className="flex items-center gap-2.5 shrink-0">
        <button 
          onClick={onMenuClick}
          className="lg:hidden size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-dim hover:text-primary transition-smooth cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Current Tool Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-primary/80 hidden sm:flex">
            <span className="material-symbols-outlined text-[18px]">
              {meta.icon}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-text-dim leading-none mb-1 hidden sm:block">Current Tool</span>
            <span className="font-bold text-text text-sm leading-none whitespace-nowrap">{meta.label}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 relative" ref={searchRef}>
        <div className="bg-surface border border-border px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/10 transition-smooth group relative">
          <span className="material-symbols-outlined text-text-dim group-focus-within:text-primary text-[18px]">
            search
          </span>
          <input
            ref={searchInputRef}
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-[13px] w-32 sm:w-48 placeholder:text-text-dim/60 font-medium text-text"
            placeholder="Search tools..."
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
          <div className="hidden sm:flex items-center gap-1 opacity-40 group-focus-within:opacity-0 transition-opacity">
            <div className="px-1.5 py-0.5 rounded border border-text-dim text-[9px] font-black font-mono">⌘</div>
            <div className="px-1.5 py-0.5 rounded border border-text-dim text-[9px] font-black font-mono">K</div>
          </div>
        </div>

        {showResults && filteredTools.length > 0 && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-float overflow-hidden animate-in">
            <div className="px-3 py-2 border-b border-border bg-surface/30">
               <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Search Results</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredTools.map(([p, m]) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    router.push(p);
                    setSearch("");
                    setShowResults(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-raised transition-smooth text-left group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-text-dim group-hover:text-primary transition-smooth">{m.icon}</span>
                  <span className="text-[13px] font-semibold text-text-sub group-hover:text-text transition-smooth">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

