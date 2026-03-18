import { Metadata } from "next";
import PasswordGenClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Secure Password Generator - High Entropy Keys",
  description: "Generate cryptographically secure passwords and secrets instantly. Customize length, entropy sources, symbols, and case settings. 100% local, no history stored.",
  keywords: ["password generator", "secure secret gen", "random string generator", "high entropy password", "secure keys"],
};

export default function Page() {
  return <PasswordGenClient />;
}
