import { Metadata } from "next";
import SettingsClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Workspace Settings - Customize Your Dashboard",
  description: "Configure your toolkit layout preferences, auto-save settings, and history retention options. All preferences are stored in your browser's local storage.",
  keywords: ["settings", "preferences", "customize workspace", "local storage config"],
};

export default function Page() {
  return <SettingsClient />;
}
