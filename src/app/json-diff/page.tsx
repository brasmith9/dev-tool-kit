import { Metadata } from "next";
import JsonDiffClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Diff Tool - Compare Two JSON Files",
  description: "Find the structural and value differences between two JSON objects instantly. Clear visual highlighting for added, removed, and modified fields. Fast, secure, and 100% local.",
  keywords: ["json diff", "compare json", "json comparison tool", "online json diff", "json differences"],
};

export default function Page() {
  return <JsonDiffClient />;
}
