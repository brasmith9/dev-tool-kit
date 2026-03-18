import { Metadata } from "next";
import IpCalculatorClient from "./ToolClient";

export const metadata: Metadata = {
  title: "IP / CIDR Calculator - Subnet Mask & Network Configuration",
  description: "Calculate network address, broadcast address, subnet mask, first/last host, and total/usable hosts for any IP/CIDR input. Essential tool for DevOps and networking engineers.",
  keywords: ["cidr calculator", "ip calculator", "subnet calculator", "ipv4 masking", "calculate netmask"],
};

export default function Page() {
  return <IpCalculatorClient />;
}
