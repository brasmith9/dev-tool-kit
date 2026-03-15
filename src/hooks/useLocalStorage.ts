"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const prefixedKey = `devtoolkit_${key}`;

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(prefixedKey);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch {
      // localStorage not available or bad JSON
    }
    setIsHydrated(true);
  }, [prefixedKey]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(
            prefixedKey,
            JSON.stringify(valueToStore)
          );
        } catch {
          // quota exceeded or not available
        }
        return valueToStore;
      });
    },
    [prefixedKey]
  );

  return [storedValue, setValue, isHydrated] as const;
}
