"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

interface NavigationWrapperProps {
  readonly children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <KeyboardShortcuts />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </main>
    </div>
  );
}
