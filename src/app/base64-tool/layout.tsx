import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder - High Performance Local Tool",
  description: "Encode and decode Base64 strings instantly. Our secure, local-first Base64 tool supports large payloads with zero data leaving your browser.",
  keywords: ["base64 encoder", "base64 decoder", "online base64 tool", "decode base64", "encode base64"],
};

export default function Base64Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
