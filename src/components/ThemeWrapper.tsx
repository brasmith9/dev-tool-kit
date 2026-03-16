"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect } from "react";

export default function ThemeWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme] = useLocalStorage<string>("dev_theme", "system");
  const [compactMode] = useLocalStorage<boolean>("dev_compact_mode", false);

  useEffect(() => {
    const root = globalThis.document?.documentElement;
    if (!root) return;
    
    // Theme logic
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System
      const isDark = globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches;
      if (isDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }

    // Compact Mode logic
    if (compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }
  }, [theme, compactMode]);

  return <>{children}</>;
}
