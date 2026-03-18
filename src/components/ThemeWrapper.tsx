"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect } from "react";

export default function ThemeWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const [compactMode, , compactHydrated] = useLocalStorage<boolean>("dev_compact_mode", false);

  useEffect(() => {
    if (!compactHydrated) return;

    const root = globalThis.document?.documentElement;
    if (!root) return;

    // Enforce Light Theme
    root.classList.remove("dark");
    
    // Compact Mode logic
    if (compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }
  }, [compactMode, compactHydrated]);

  return <>{children}</>;
}


