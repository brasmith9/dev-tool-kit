import { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAML to JSON Converter - Fast and Secure Data Transformation",
  description: "Convert YAML to JSON and JSON to YAML instantly. High-performance, local-first transformation tool for developers.",
  keywords: ["yaml to json", "json to yaml", "convert yaml", "data converter", "online yaml tool"],
};

export default function YamlJsonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
