import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "GUID / UUID Generator - Secure & Unique Identifiers",
  description: "Generate secure and unique GUIDs / UUIDs (v1, v4, v5) for your applications. Bulk generation supported. Fast, free, and completely local.",
  keywords: ["guid generator", "v4 uuid generator", "online uuid generator", "bulk guid geneation", "unique identifiers"],
};

export default function GuidGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "DevToolkit",
        "item": "ttps://devtools.isaacanane.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "GUID Generator",
        "item": "ttps://devtools.isaacanane.com/guid-generator"
      }
    ]
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  );
}
