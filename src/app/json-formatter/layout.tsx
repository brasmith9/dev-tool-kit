import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator - Beautify Your Data",
  description: "Free online JSON Formatter and Validator. Beautify, minify, and validate your JSON data instantly. Secure, local processing for your sensitive data.",
  keywords: ["json formatter", "beautify json", "json validator", "minify json", "clean json"],
};

export default function JsonFormatterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
