import { Metadata } from "next";
import CronParserClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cron Expression Parser - Human-Readable Schedules",
  description: "Parse and explain cron expressions in simple English. View upcoming execution dates and test your scheduling patterns instantly. Fast and 100% local.",
  keywords: ["cron parser", "cron translation", "what is this cron", "crontab tool", "cron to english", "linux scheduling"],
};

export default function Page() {
  return <CronParserClient />;
}
