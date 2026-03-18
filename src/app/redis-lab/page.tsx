import { Metadata } from "next";
import RedisLabClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Redis Cache Lab - TTL & Eviction Simulation",
  description: "Simulate Redis key/value storage with TTL (Time-To-Live) and various eviction policies like LRU. Visualize hit/miss ratios and memory management locals. 100% secure.",
  keywords: ["redis lab", "redis simulation", "cache eviction simulator", "lru vs lfu", "redis ttl tool"],
};

export default function Page() {
  return <RedisLabClient />;
}
