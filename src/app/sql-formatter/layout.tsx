import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQL Formatter - Prettify and Clean Your SQL Queries",
  description: "Free online SQL formatter. Clean up your SQL queries with standard indentation and color-coded keywords. Supports MySQL, PostgreSQL, and more.",
  keywords: ["sql formatter", "prettify sql", "clean sql", "online sql tool", "sql beautifier"],
};

export default function SqlFormatterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
