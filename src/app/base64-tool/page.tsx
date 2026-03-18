import { Metadata } from "next";
import Base64ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder - Local Data Tool",
  description: "Encode or decode strings instantly with Base64. High-performance, secure, and 100% local. No data leaves your machine. Essential for web development and data serialization.",
  keywords: ["base64 encoder", "base64 decoder", "b64", "encode b64", "decode base64", "online base64 tool"],
};

export default function Page() {
  return <Base64ToolClient />;
}
