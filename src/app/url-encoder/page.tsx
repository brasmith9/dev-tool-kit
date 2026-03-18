import { Metadata } from "next";
import UrlEncoderClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder - Handle URIs Instantly",
  description: "Encode or decode strings into URL-safe formats. Fast, secure, and 100% local. Perfect for cleaning up parameters and testing endpoints.",
  keywords: ["url encoder", "url decoder", "percent encoding", "decode uri", "encode uri"],
};

export default function Page() {
  return <UrlEncoderClient />;
}
