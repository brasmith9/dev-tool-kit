import { Metadata } from "next";
import GuidGeneratorClient from "./ToolClient";

export const metadata: Metadata = {
  title: "UUID / GUID Generator (v1, v4, v5)",
  description: "Generate secure, random UUIDs (v4) or time-based GUIDs (v1) instantly. Support for bulk generation, uppercase/lowercase, and custom formatting. 100% local.",
  keywords: ["uuid generator", "guid generator", "v4 uuid", "online guid", "bulk uuid", "random guid"],
};

export default function Page() {
  return <GuidGeneratorClient />;
}
