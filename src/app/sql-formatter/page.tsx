import { Metadata } from "next";
import SqlFormatterClient from "./ToolClient";

export const metadata: Metadata = {
  title: "SQL Formatter & Beautifier - Clean Up Database Queries",
  description: "Format and beautify raw SQL queries for better readability. Supports standard SQL, indentation controls, and results are processed 100% locally. Ideal for debugging and documentation.",
  keywords: ["sql formatter", "beautify sql", "clean up sql", "format query", "online sql tool"],
};

export default function Page() {
  return <SqlFormatterClient />;
}
