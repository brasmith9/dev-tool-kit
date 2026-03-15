import { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encoder & Decoder - Percent Encoding Tool",
  description: "Quickly encode or decode strings for use in URLs. Professional percent-encoding tool with support for double encoding and decoding.",
  keywords: ["url encoder", "url decoder", "percent encoding", "decode url", "encode url string"],
};

export default function UrlEncoderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
