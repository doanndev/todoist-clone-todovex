"use client";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import SidebarContent from "./sidebar-content";
import TopBar from "./top-bar";

export default function AppShell({ children }: { children: ReactNode }) {
  // The calendar needs the room; every list page keeps one reading measure.
  const wide = usePathname().startsWith("/loggedin/calendar");
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to tasks
      </a>
      <aside className="hidden md:block" aria-label="Sidebar">
        <div className="sticky top-0 h-dvh">
          <SidebarContent />
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <TopBar />
        <main
          id="main"
          className={cn(
            "mx-auto w-full flex-1 px-4 pb-24 pt-8 md:px-10 md:pt-12",
            wide ? "max-w-[1400px] md:pt-8" : "max-w-[760px]",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
