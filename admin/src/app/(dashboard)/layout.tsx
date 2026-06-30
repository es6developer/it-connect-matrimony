"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/store";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "pt-14 transition-all duration-300",
          collapsed ? "ml-16" : "ml-60"
        )}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
