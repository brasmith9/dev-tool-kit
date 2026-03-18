import { Metadata } from "next";
import JsonToCodeClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to Code Converter (TypeScript, C#, Go, Java)",
  description: "Convert JSON objects into high-quality code. Generates TypeScript interfaces, C# classes, Go structs, and Java POJOs automatically from any JSON input.",
  keywords: ["json to typescript", "json to csharp", "json to go", "json to code", "json to java", "convert json to interface"],
};

export default function Page() {
  return <JsonToCodeClient />;
}
