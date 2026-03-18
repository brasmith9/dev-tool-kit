import { Metadata } from "next";
import RegexTesterClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Regex Tester & Debugger - Test Regular Expressions",
  description: "Test your regular expressions in real-time with pattern matching and grouping. Clear visual highlighting for matches and capture groups. Supports JS global/case-insensitive flags. 100% local.",
  keywords: ["regex tester", "test regex", "regular expression checker", "online regex debugger", "pattern matching"],
};

export default function Page() {
  return <RegexTesterClient />;
}
