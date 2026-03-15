import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Parser & Visualizer - Human Readable Cron Expressions",
  description: "Convert cryptic cron expressions into clear, human-readable descriptions. Built-in reference and examples for standard and quartz cron formats.",
  keywords: ["cron parser", "cron visualizer", "cron expression explain", "human readable cron", "cron reference"],
};

export default function CronParserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
