import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DevToolkit - The Ultimate Backend Developer Workspace",
  description: "A comprehensive, 100% local toolkit for backend developers. JSON formatting, GUID generation, JWT debugging, Regex testing, and more in one high-performance dashboard.",
};

const toolCategories = [
  {
    title: "Security & Identity",
    tools: [
      { id: "guid", label: "GUID Generator", icon: "fingerprint", href: "/guid-generator", desc: "v1, v4, v5 UUIDs", color: "text-primary", bg: "bg-primary-light" },
      { id: "jwt", label: "JWT Debugger", icon: "vpn_key", href: "/jwt-debugger", desc: "Decode & verify tokens", color: "text-accent-purple", bg: "bg-accent-purple/5" },
      { id: "hash", label: "Hash Generator", icon: "enhanced_encryption", href: "/hash-generator", desc: "SHA, MD5, RIPEMD", color: "text-accent-pink", bg: "bg-accent-pink/5" },
      { id: "pass", label: "Password Gen", icon: "password", href: "/password-generator", desc: "Secure entropy keys", color: "text-accent-amber", bg: "bg-accent-amber/5" },
    ]
  },
  {
    title: "Data & Formatting",
    tools: [
      { id: "json", label: "JSON Formatter", icon: "data_object", href: "/json-formatter", desc: "Beautify & validate", color: "text-accent-green", bg: "bg-accent-green/5" },
      { id: "json-code", label: "JSON to Code", icon: "code", href: "/json-to-code", desc: "Classes & interfaces", color: "text-accent-blue", bg: "bg-accent-blue/5" },
      { id: "diff", label: "JSON Diff", icon: "difference", href: "/json-diff", desc: "Compare two JSONs", color: "text-accent-purple", bg: "bg-accent-purple/5" },
      { id: "yaml", label: "YAML / JSON", icon: "schema", href: "/yaml-json", desc: "Convert between formats", color: "text-accent-teal", bg: "bg-accent-teal/5" },
      { id: "sql", label: "SQL Formatter", icon: "database", href: "/sql-formatter", desc: "Clean up queries", color: "text-primary", bg: "bg-primary/5" },
    ]
  },
  {
    title: "Networking & Backend",
    tools: [
      { id: "ip", label: "IP Calculator", icon: "lan", href: "/ip-calculator", desc: "CIDR & subnetting", color: "text-accent-blue", bg: "bg-accent-blue/5" },
      { id: "curl", label: "cURL Converter", icon: "transform", href: "/curl-converter", desc: "Request to code", color: "text-accent-teal", bg: "bg-accent-teal/5" },
      { id: "http", label: "HTTP Inspector", icon: "rebase_edit", href: "/http-inspector", desc: "Raw request parser", color: "text-primary", bg: "bg-primary/5" },
      { id: "epoch", label: "Epoch Converter", icon: "schedule", href: "/epoch-converter", desc: "Unix timestamp tool", color: "text-primary", bg: "bg-primary/5" },
      { id: "cron", label: "Cron Parser", icon: "event_repeat", href: "/cron-parser", desc: "Schedule humanizer", color: "text-accent-purple", bg: "bg-accent-purple/5" },
      { id: "regex", label: "Regex Tester", icon: "manage_search", href: "/regex-tester", desc: "Regular expressions", color: "text-accent-amber", bg: "bg-accent-amber/10" },
      { id: "base64", label: "Base64", icon: "code", href: "/base64-tool", desc: "Encode & decode", color: "text-accent-amber", bg: "bg-accent-amber/5" },
    ]
  },
  {
    title: "Architecture & Systems",
    tools: [
      { id: "kafka", label: "Kafka Visualizer", icon: "hub", href: "/kafka-visualizer", desc: "Animated data flow", color: "text-primary", bg: "bg-primary/5" },
      { id: "redis", label: "Redis Cache Lab", icon: "memory", href: "/redis-lab", desc: "TTL & Eviction Lab", color: "text-accent-red", bg: "bg-accent-red/5" },
      { id: "lb", label: "Load Balancer", icon: "architecture", href: "/load-balancer", desc: "Traffic distribution", color: "text-accent-blue", bg: "bg-accent-blue/5" },
    ]
  }
];

export default function DashboardPage() {
  return (
    <div className="animate-in space-y-10 pb-12">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-border shadow-float p-10 md:p-14">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-light/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text leading-none mb-4">
             Your Essential <br/> <span className="text-primary">Backend Workspace.</span>
           </h1>
           <p className="text-lg text-text-sub font-medium leading-relaxed mb-8">
             A high-performance toolkit for developers. All data stays local, all tools are instant, and the design is built for focus.
           </p>
           <div className="flex flex-wrap gap-4">
             <Link href="/guid-generator" className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-card hover:bg-primary-hover transition-smooth flex items-center gap-2">
                Quick Start <span className="material-symbols-outlined text-[18px]">bolt</span>
             </Link>
             <Link href="/settings" className="px-6 py-3 bg-surface-raised text-text font-bold rounded-xl border border-border hover:bg-white hover:shadow-card transition-smooth">
                Configure Prefs
             </Link>
           </div>
        </div>
        
        {/* Visual Decoration */}
        <div className="hidden lg:block absolute right-14 top-1/2 -translate-y-1/2 space-y-4">
           {([1, 0.6, 0.3] as const).map((op, i) => {
             const icons = ['terminal', 'database', 'settings_ethernet'] as const;
             return (
               <div key={icons[i]} className="flex gap-4" style={{ opacity: op }}>
                  <div className="size-14 rounded-2xl bg-white border border-border shadow-card flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[28px]">{icons[i]}</span>
                  </div>
                  <div className="w-32 h-14 rounded-2xl bg-white border border-border shadow-card" />
               </div>
             );
           })}
        </div>
      </section>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {toolCategories.map((cat) => (
          <div key={cat.title} className="space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-dim ml-5">{cat.title}</h2>
            <div className="flex flex-col gap-3">
              {cat.tools.map((tool) => (
                <Link 
                  key={tool.id} 
                  href={tool.href}
                  className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover hover:border-primary/20 transition-smooth"
                >
                  <div className={`size-12 rounded-xl ${tool.bg} flex items-center justify-center ${tool.color} transition-smooth group-hover:scale-110`}>
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>{tool.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[15px] text-text mb-0.5">{tool.label}</h3>
                    <p className="text-[12px] font-medium text-text-dim">{tool.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-text-dim/30 group-hover:text-primary transition-smooth translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Info */}
      <footer className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
         <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-text-dim/20" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Built for performance</span>
         </div>
         <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest hover:text-text transition-smooth">
           <Link href="https://github.com/brasmith9/dev-tool-kit">Github</Link>
           <Link href="https://github.com/brasmith9/dev-tool-kit/blob/main/README.md">Documentation</Link>
           <Link href="/privacy">Privacy</Link>
         </div>
      </footer>
    </div>
  );
}
