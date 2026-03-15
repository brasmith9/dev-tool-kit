import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unix Epoch Converter - Convert Timestamps and Dates",
  description: "Quickly convert Unix timestamps to human-readable dates and vice versa. High-precision Epoch converter for backend developers.",
  keywords: ["epoch converter", "unix timestamp", "convert unix time", "timestamp to date", "epoch timestamp"],
};

export default function EpochConverterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
