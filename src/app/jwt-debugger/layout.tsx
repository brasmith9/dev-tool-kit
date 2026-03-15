import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Debugger - Decode and Verify JSON Web Tokens",
  description: "Decode and verify JWT (JSON Web Tokens) instantly. Inspect the header, payload, and signature. Secure, browser-side decoding for developer privacy.",
  keywords: ["jwt debugger", "decode jwt", "verify jwt", "jwt payload", "jwt header inspect"],
};

export default function JwtDebuggerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
