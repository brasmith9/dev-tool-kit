import { Metadata } from "next";
import JsonFormatterClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator",
  description: "Beautify, format, and validate JSON data instantly. Detect syntax errors like trailing commas or missing quotes in real-time. 100% local and secure.",
  keywords: ["json formatter", "json validator", "beautify json", "fix json errors", "json tool", "backend tools"],
};

export default function Page() {
  return <JsonFormatterClient />;
}
