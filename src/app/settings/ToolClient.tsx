"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState } from "react";

export default function SettingsPage() {
  const [autoSave, setAutoSave, autoSaveHydrated] = useLocalStorage<boolean>("dev_autosave", true);
  const [maxHistory, setMaxHistory, maxHistoryHydrated] = useLocalStorage<number>("dev_max_history", 100);
  const [notifications, setNotifications, notifHydrated] = useLocalStorage<boolean>("dev_notifications", true);
  const [compactMode, setCompactMode, compactHydrated] = useLocalStorage<boolean>("dev_compact_mode", false);
  
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hydrated = autoSaveHydrated && maxHistoryHydrated && notifHydrated && compactHydrated;

  if (!hydrated) return (
    <div className="flex items-center justify-center h-full opacity-50">
      <span className="material-symbols-outlined animate-spin">refresh</span>
    </div>
  );

  return (
    <div className="animate-in flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Workspace Settings</h2>
          <p className="text-text-sub text-sm mt-1">
            Customize your toolkit experience. Preferences are stored locally.
          </p>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-smooth shadow-card cursor-pointer ${
            saved ? "bg-accent-green text-white" : "bg-primary text-white hover:bg-primary-hover"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {saved ? "check" : "save"}
          </span>
          {saved ? "Preferences Saved" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-10">
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Appearance */}
          <section className="bg-surface rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-sm tracking-widest uppercase text-text-dim flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
              Visual Style
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-surface-raised/50 border border-border cursor-pointer hover:bg-surface transition-smooth group">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-accent-teal/10 text-accent-teal flex items-center justify-center group-hover:scale-110 transition-smooth">
                      <span className="material-symbols-outlined">zoom_in_map</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-text">Compact Interface</span>
                      <p className="text-[11px] font-medium text-text-dim mt-0.5">Optimize screen space with denser spacing</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Toggle Compact Interface"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="size-5 accent-primary rounded-md cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Productivity */}
          <section className="bg-surface rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-sm tracking-widest uppercase text-text-dim flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
              Workflow Tools
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-surface-raised/50 border border-border cursor-pointer hover:bg-surface transition-smooth group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center group-hover:scale-110 transition-smooth">
                    <span className="material-symbols-outlined">history</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-text">Auto-save History</span>
                    <p className="text-[11px] font-medium text-text-dim mt-0.5">Retain your tool inputs across sessions</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  aria-label="Toggle Auto-save History"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="size-5 accent-primary rounded-md cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-surface-raised/50 border border-border cursor-pointer hover:bg-surface transition-smooth group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-accent-amber/10 text-accent-amber flex items-center justify-center group-hover:scale-110 transition-smooth">
                    <span className="material-symbols-outlined">notifications</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-text">Desktop Notifications</span>
                    <p className="text-[11px] font-medium text-text-dim mt-0.5">Alert when long processes finish</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  aria-label="Toggle Desktop Notifications"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="size-5 accent-primary rounded-md cursor-pointer"
                />
              </label>

              <div className="p-4 rounded-xl bg-surface-raised/50 border border-border mt-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-accent-purple/10 text-accent-purple flex items-center justify-center">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-text">History Retention</span>
                      <p className="text-[11px] font-medium text-text-dim mt-0.5">Limit items stored per tool</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary text-white text-xs font-black rounded-lg">{maxHistory}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  aria-label="Max History Range"
                  value={maxHistory}
                  onChange={(e) => setMaxHistory(Number.parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-bold text-text-dim mt-2 tracking-widest uppercase">
                  <span>10 Items</span>
                  <span>500 Items</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Info Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <section className="bg-surface rounded-2xl border border-border shadow-card p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
            <h3 className="font-bold text-sm tracking-widest uppercase text-text-dim flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-text-dim text-[20px]">info</span>
              Application
            </h3>
            <div className="space-y-3">
              {[
                { label: "Edition", value: "Standard Local" },
                { label: "Build ID", value: "2024.03.V2" },
                { label: "Storage", value: "Browser IndexDB" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl border border-border bg-surface/50">
                  <p className="text-[9px] font-black text-text-dim uppercase tracking-[0.15em] mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-text">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-sm tracking-widest uppercase text-text-dim flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-text-dim text-[20px]">keyboard</span>
              Hotkeys
            </h3>
            <div className="space-y-4">
              {[
                { k: "⌘ K", desc: "Omni-search" },
                { k: "⌘ G", desc: "Gen UUID" },
                { k: "⌘ J", desc: "JSON Fix" },
              ].map((h) => (
                <div key={h.k} className="flex items-center justify-between group">
                  <span className="text-[12px] font-bold text-text-sub group-hover:text-text transition-colors">{h.desc}</span>
                  <div className="px-2 py-1 rounded-lg bg-surface-raised border border-border text-[10px] font-mono font-black shadow-sm group-hover:border-primary/50 transition-colors">
                    {h.k}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[11px] font-bold text-text-dim italic text-center">More shortcuts coming soon...</p>
          </section>
        </div>
      </div>
    </div>
  );
}
