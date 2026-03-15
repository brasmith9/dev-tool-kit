import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "JSON Diff Tool - Compare and Visualize JSON Differences",
  description: "Compare two JSON objects side-by-side with our high-performance JSON Diff tool. Visualize added, modified, and removed keys instantly. 100% local and secure.",
  keywords: ["json diff", "compare json", "json difference", "online json diff", "visual json compare"],
};

export default function JsonDiffLayout({
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
        "name": "JSON Diff Tool",
        "item": "ttps://devtools.isaacanane.com/json-diff"
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
