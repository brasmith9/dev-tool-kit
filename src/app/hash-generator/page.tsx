import { Metadata } from "next";
import HashGeneratorClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Hash Generator - SHA-256, MD5, RIPEMD",
  description: "Generate secure cryptographic hashes for strings. Supports SHA-256, SHA-512, MD5, RIPEMD, and more. Instant, 100% local, and no data leaves your browser.",
  keywords: ["sha256 generator", "md5 hash", "hash text", "sha512 generator", "ripemd", "cryptographic hash generator"],
};

export default function Page() {
  return <HashGeneratorClient />;
}
