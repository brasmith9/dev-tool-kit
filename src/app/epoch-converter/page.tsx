import { Metadata } from "next";
import EpochConverterClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Epoch / Unix Timestamp Converter - Human Dates to Seconds",
  description: "Convert Unix timestamps (Epoch) to human-readable dates and vice-versa. Real-time updates, support for milliseconds, and 100% local. The essential time tool for backend developers.",
  keywords: ["epoch converter", "unix timestamp", "convert date to epoch", "time to seconds", "timestamp to human"],
};

export default function Page() {
  return <EpochConverterClient />;
}
