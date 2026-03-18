import { Metadata } from "next";
import YamlJsonClient from "./ToolClient";

export const metadata: Metadata = {
  title: "YAML / JSON Converter - Bi-directional Conversion",
  description: "Convert YAML configurations into JSON and vice-versa instantly. Supports real-time validation and clean formatting. Essential for Kubernetes, Docker, and API configs.",
  keywords: ["yaml to json", "json to yaml", "convert yaml", "k8s config converter", "online yaml tool"],
};

export default function Page() {
  return <YamlJsonClient />;
}
