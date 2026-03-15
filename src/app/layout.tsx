import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";

const softwareAppData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DevToolkit",
  "operatingSystem": "Web",
  "applicationCategory": "DeveloperApplication",
  "description": "Enterprise-grade developer toolkit with GUID generator, JSON formatter, Base64 encoder, JWT debugger and more.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "Isaac Amankwaah Anane"
  }
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("ttps://devtools.isaacanane.com"),
  title: {
    default: "DevToolkit - Professional Backend Developer Utilities",
    template: "%s | DevToolkit"
  },
  description: "A high-performance toolkit for backend developers. GUID generator, JSON formatter, Base64 encoder, JWT debugger, Regex tester, and more. All data stays local for maximum security.",
  keywords: ["developer tools", "json formatter", "guid generator", "regex tester", "jwt debugger", "base64", "backend tools", "unix epoch", "cron parser", "sql formatter", "yaml to json"],
  authors: [{ name: "Isaac Amankwaah Anane" }],
  creator: "Isaac Amankwaah Anane",
  publisher: "DevToolkit",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "DevToolkit - Essential Backend Workspace",
    description: "Instant, local, and secure developer tools for the modern backend engineer.",
    url: "ttps://devtools.isaacanane.com",
    siteName: "DevToolkit",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "DevToolkit Branding",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevToolkit - Professional Developer Utilities",
    description: "High-performance toolkit for backend developers. 100% local, no data leaves your browser.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={softwareAppData} />
      </head>
      <body
        className={`${inter.variable} font-display bg-background-light text-text-primary min-h-screen antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            <Header />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
