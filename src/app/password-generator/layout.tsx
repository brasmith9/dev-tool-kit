import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Password Generator - Cryptographically Strong Entropy",
  description: "Generate highly secure, cryptographically strong passwords locally. Customize length, characters, and symbols for maximum security.",
  keywords: ["password generator", "secure passwords", "random password generator", "strong passwords", "offline password gen"],
};

export default function PasswordGeneratorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
