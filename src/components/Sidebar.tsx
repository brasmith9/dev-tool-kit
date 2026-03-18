"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const tools = [
  { label: "Dashboard", icon: "space_dashboard", href: "/" },
  { label: "GUID Generator", icon: "fingerprint", href: "/guid-generator" },
  { label: "JSON Formatter", icon: "data_object", href: "/json-formatter" },
  { label: "JSON to Code", icon: "code", href: "/json-to-code" },
  { label: "JSON Diff", icon: "difference", href: "/json-diff" },
  { label: "IP Calculator", icon: "lan", href: "/ip-calculator" },
  { label: "cURL Converter", icon: "transform", href: "/curl-converter" },
  { label: "HTTP Inspector", icon: "rebase_edit", href: "/http-inspector" },
  { label: "Base64", icon: "code", href: "/base64-tool" },
  { label: "JWT Tool", icon: "vpn_key", href: "/jwt-debugger" },
  { label: "Regex Tester", icon: "manage_search", href: "/regex-tester" },
  { label: "Hash Generator", icon: "enhanced_encryption", href: "/hash-generator" },
  { label: "URL Encoder", icon: "link", href: "/url-encoder" },
  { label: "Epoch Converter", icon: "schedule", href: "/epoch-converter" },
  { label: "SQL Formatter", icon: "database", href: "/sql-formatter" },
  { label: "Cron Parser", icon: "event_repeat", href: "/cron-parser" },
  { label: "YAML / JSON", icon: "schema", href: "/yaml-json" },
  { label: "Kafka Visualizer", icon: "hub", href: "/kafka-visualizer" },
  { label: "Redis Cache Lab", icon: "memory", href: "/redis-lab" },
  { label: "Load Balancer", icon: "architecture", href: "/load-balancer" },
  { label: "Password Gen", icon: "password", href: "/password-generator" },
];

interface SidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button 
          type="button"
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] lg:hidden animate-in fade-in transition-smooth"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-[216px] bg-surface border-r border-border flex flex-col shrink-0 h-screen select-none transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0
        ${isOpen ? "translate-x-0 shadow-float" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Brand */}
        <div className="flex items-center justify-between lg:justify-start pr-2 sticky top-0 bg-surface z-10">
          <Link href="/" className="flex items-center gap-2.5 px-5 pt-5 pb-4 group flex-1" onClick={onClose}>
            <div className="size-8 rounded-lg overflow-hidden flex items-center justify-center shadow-card border border-primary/10">
              <Image 
                src="/icon.png" 
                alt="DevToolkit Logo" 
                width={32} 
                height={32} 
                className="object-cover"
              />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-text">
              DevToolkit
            </span>
          </Link>
          
          <button 
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 text-text-dim hover:text-text transition-smooth cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Label */}
        <div className="px-5 pb-1.5 pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-dim">
            Tools
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 flex flex-col gap-px">
          {tools.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-smooth ${
                  active
                    ? "bg-primary text-white font-semibold shadow-card"
                    : "text-text-sub hover:bg-surface-raised font-medium"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    active ? "text-white/90" : "text-text-dim group-hover:text-text-sub"
                  }`}
                  style={{ fontVariationSettings: active ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" : undefined }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2.5 pb-6 flex flex-col gap-px border-t border-border pt-3">
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-smooth ${
              pathname === "/settings"
                ? "bg-primary text-white font-semibold shadow-card"
                : "text-text-sub hover:bg-surface-raised font-medium"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                pathname === "/settings" ? "text-white/90" : "text-text-dim"
              }`}
            >
              settings
            </span>
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
