import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hash Generator - Secure SHA, MD5, and HMAC Tools",
  description: "Generate secure cryptographic hashes (SHA-256, MD5, RIPEMD) instantly in your browser. No data is sent to server.",
  keywords: ["hash generator", "sha256 online", "md5 generator", "cryptographic hash tool", "secure hashing"],
};

export default function HashGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
