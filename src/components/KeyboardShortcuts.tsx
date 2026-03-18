"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd or Ctrl modifier
      const isModifier = e.metaKey || e.ctrlKey;
      
      if (isModifier) {
        switch (e.key.toLowerCase()) {
          case "g":
            e.preventDefault();
            router.push("/guid-generator");
            break;
          case "j":
            e.preventDefault();
            router.push("/json-formatter");
            break;
          // Add more shortcuts here if needed
          default:
            break;
        }
      }
    };

    globalThis.document?.addEventListener("keydown", handleKeyDown);
    return () => globalThis.document?.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
