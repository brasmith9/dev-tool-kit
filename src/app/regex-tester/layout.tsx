import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Regex Tester & Debugger - Test Regular Expressions Live",
  description: "Real-time regular expression tester and debugger. Test your regex patterns against strings with live match highlighting and capture group details.",
  keywords: ["regex tester", "online regex debugger", "regular expression checker", "regex live", "js regex test"],
};

export default function RegexTesterLayout({
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
        "item": "https://devtoolkit.isaacanane.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Regex Tester",
        "item": "https://devtoolkit.isaacanane.com/regex-tester"
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
