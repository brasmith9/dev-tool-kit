import { Metadata } from "next";
import LoadBalancerClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Load Balancer Simulator - Traffic Distribution Lab",
  description: "Test different load balancing algorithms like Round Robin, Least Connections, and weighted options in real-time. Visualize request distribution across server clusters.",
  keywords: ["load balancer simulator", "load balancing algorithms", "round robin viz", "least connections", "request distribution"],
};

export default function Page() {
  return <LoadBalancerClient />;
}
