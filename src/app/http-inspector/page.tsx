import { Metadata } from "next";
import HttpInspectorClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Request Inspector - Raw Message Parser",
  description: "Parse and visualize raw HTTP request messages. View verbs, paths, headers, and payloads in a structured dashboard. 100% local, ideal for debugging webhooks and proxies.",
  keywords: ["http inspector", "raw http parser", "inspect webhook", "http header viewer", "debug http", "request analyzer"],
};

export default function Page() {
  return <HttpInspectorClient />;
}
