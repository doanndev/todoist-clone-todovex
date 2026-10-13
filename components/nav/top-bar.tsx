"use client";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import Spotlight from "./spotlight";
import SidebarContent from "./sidebar-content";
import ThemeToggle from "./theme-toggle";

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The drawer closes itself once a destination is chosen.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b bg-background">
      <div className="mx-auto flex h-full w-full max-w-[760px] items-center gap-2 px-4 md:px-10">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-accent active:scale-95 md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] max-w-[85vw] border-0 bg-rail p-0 text-rail-foreground [&>button]:text-rail-foreground [&>button]:ring-offset-rail"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <Spotlight />
        </div>
        <ThemeToggle className="shrink-0" />
      </div>
    </header>
  );
}
