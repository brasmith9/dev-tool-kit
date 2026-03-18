import { Metadata } from "next";
import KafkaVisualizerClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kafka Visualizer - Animated Topic Data Flow",
  description: "Visualize Apache Kafka concepts like producers, consumer groups, and partitions with high-performance animations. Test data flow scenarios locally and instantly.",
  keywords: ["kafka visualizer", "apache kafka tool", "message flow", "kafka animation", "learn kafka"],
};

export default function Page() {
  return <KafkaVisualizerClient />;
}
