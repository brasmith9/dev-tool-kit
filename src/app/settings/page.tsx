"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("system");
  const [autoSave, setAutoSave] = useState(true);
  const [maxHistory, setMaxHistory] = useState(100);
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-text-secondary text-sm mt-0.5">
            Configure your DevToolkit preferences.
          </p>
        </div>
        <button
          onClick={saveSettings}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer card-shadow ${
            saved
              ? "bg-green-500 text-white"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {saved ? "check" : "save"}
          </span>
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
          {/* Appearance */}
          <div className="bg-white rounded-xl border border-border card-shadow p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">
                palette
              </span>
              Appearance
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">
                  Theme
                </p>
                <div className="flex gap-2">
                  {[
                    { id: "light", icon: "light_mode", label: "Light" },
                    { id: "dark", icon: "dark_mode", label: "Dark" },
                    { id: "system", icon: "contrast", label: "System" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                        theme === t.id
                          ? "bg-primary text-white"
                          : "bg-background-light border border-border text-text-secondary hover:border-primary/30"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {t.icon}
                      </span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between p-3 rounded-lg bg-background-light border border-border cursor-pointer hover:border-primary/30 transition-colors">
                <div>
                  <span className="text-sm font-medium">Compact Mode</span>
                  <p className="text-xs text-text-muted mt-0.5">
                    Reduce padding for denser layout
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  className="accent-primary rounded"
                />
              </label>
            </div>
          </div>

          {/* General */}
          <div className="bg-white rounded-xl border border-border card-shadow p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">
                tune
              </span>
              General
            </h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3 rounded-lg bg-background-light border border-border cursor-pointer hover:border-primary/30 transition-colors">
                <div>
                  <span className="text-sm font-medium">
                    Auto-save History
                  </span>
                  <p className="text-xs text-text-muted mt-0.5">
                    Automatically save results to history
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="accent-primary rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg bg-background-light border border-border cursor-pointer hover:border-primary/30 transition-colors">
                <div>
                  <span className="text-sm font-medium">Notifications</span>
                  <p className="text-xs text-text-muted mt-0.5">
                    Show notifications for completed operations
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="accent-primary rounded"
                />
              </label>
              <div className="p-3 rounded-lg bg-background-light border border-border">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm font-medium">
                      Max History Items
                    </span>
                    <p className="text-xs text-text-muted mt-0.5">
                      Maximum items to keep in history
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {maxHistory}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={maxHistory}
                  onChange={(e) =>
                    setMaxHistory(Number.parseInt(e.target.value, 10))
                  }
                  className="w-full accent-primary h-1.5 bg-border rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>10</span>
                  <span>500</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          {/* About */}
          <div className="bg-white rounded-xl border border-border card-shadow p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-text-muted text-lg">
                info
              </span>
              About
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Version", value: "2.4.0" },
                { label: "License", value: "Enterprise" },
                { label: "Build", value: "#2024.03.15-rc1" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-lg bg-background-light border border-border"
                >
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-white rounded-xl border border-border card-shadow p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-text-muted text-lg">
                keyboard
              </span>
              Keyboard Shortcuts
            </h3>
            <div className="flex flex-col gap-1.5">
              {[
                { key: "⌘ K", action: "Search tools" },
                { key: "⌘ G", action: "Generate GUID" },
                { key: "⌘ J", action: "Format JSON" },
                { key: "⌘ B", action: "Base64 encode" },
                { key: "⌘ D", action: "JWT decode" },
              ].map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-2"
                >
                  <span className="text-sm text-text-secondary">
                    {shortcut.action}
                  </span>
                  <kbd className="px-2 py-0.5 rounded bg-background-light border border-border text-[11px] font-mono font-semibold text-text-secondary">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
