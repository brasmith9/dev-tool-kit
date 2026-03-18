import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import ThemeWrapper from "@/components/ThemeWrapper";
import NavigationWrapper from "@/components/NavigationWrapper";

const softwareAppData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DevToolkit",
  "operatingSystem": "Web",
  "applicationCategory": "DeveloperApplication",
  "description": "Enterprise-grade developer toolkit with Kafka visualizer, Load balancer simulator, Redis lab, JSON to Code, JWT debugger and more.",
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
  metadataBase: new URL("https://devtools.isaacanane.com"),
  title: {
    default: "DevToolkit - Professional Backend Developer Utilities",
    template: "%s | DevToolkit"
  },
  description: "A high-performance, secure, and 100% local toolkit for backend developers. Features Kafka visualizer, Redis Lab, JWT Debugger, JSON to Code, and 20+ other essential utilities.",
  keywords: ["developer tools", "backend tools", "kafka visualizer", "redis lab", "jwt debugger", "json to typescript", "curl to code", "json formatter", "uuid generator", "online developer tools"],
  authors: [{ name: "Isaac Amankwaah Anane" }],
  creator: "Isaac Amankwaah Anane",
  publisher: "DevToolkit",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "DevToolkit - Professional Developer Workspace",
    description: "Instant, local, and secure developer tools for the modern backend engineer.",
    url: "https://devtools.isaacanane.com",
    siteName: "DevToolkit",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DevToolkit" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevToolkit - Essential Backend Tools",
    description: "20+ high-performance developer utilities. 100% local, no data leaves your browser.",
    images: ["/og-image.png"],
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
        className={`${inter.variable} font-display bg-background text-text min-h-screen antialiased`}
      >
        <ThemeWrapper>
          <NavigationWrapper>
            {children}
          </NavigationWrapper>
        </ThemeWrapper>
      </body>
    </html>
  );
}
