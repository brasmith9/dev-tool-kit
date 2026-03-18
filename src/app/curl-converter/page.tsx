import { Metadata } from "next";
import CurlConverterClient from "./ToolClient";

export const metadata: Metadata = {
  title: "cURL to Code Converter (JavaScript, Python, C#)",
  description: "Quickly convert shell cURL commands into clean, ready-to-use boilerplate code for Fetch API, Python requests, C# HttpClient, and axios. High performance, 100% local.",
  keywords: ["curl to fetch", "curl to python", "curl to axios", "curl to csharp", "convert curl to code", "http request builder"],
};

export default function Page() {
  return <CurlConverterClient />;
}
