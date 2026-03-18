"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const prefixedKey = `devtoolkit_${key}`;

  const getSnapshot = () => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(prefixedKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getSnapshot);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync on mount
  useEffect(() => {
    setStoredValue(getSnapshot());
    setIsHydrated(true);
  }, []);

  // Listen for changes from other tabs AND other instances in same tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        if (e.key === prefixedKey) {
          setStoredValue(getSnapshot());
        }
      } else if (e.detail?.key === prefixedKey) {
        setStoredValue(getSnapshot());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage-sync", handleStorageChange as EventListener);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage-sync", handleStorageChange as EventListener);
    };
  }, [prefixedKey]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(prefixedKey, JSON.stringify(valueToStore));
          // Notify other instances in the same tab
          window.dispatchEvent(new CustomEvent("local-storage-sync", { detail: { key: prefixedKey } }));
        } catch {
          // quota exceeded
        }
        return valueToStore;
      });
    },
    [prefixedKey]
  );

  return [storedValue, setValue, isHydrated] as const;
}

