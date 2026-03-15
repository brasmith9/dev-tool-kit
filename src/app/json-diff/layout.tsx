import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Diff Tool - Compare and Visualize JSON Differences",
  description: "Compare two JSON objects side-by-side with our high-performance JSON Diff tool. Visualize added, modified, and removed keys instantly. 100% local and secure.",
  keywords: ["json diff", "compare json", "json difference", "online json diff", "visual json compare"],
};

export default function JsonDiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
