"use client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import type { CalendarView } from "@/lib/calendar";
import { viewTitle } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const VIEWS: Array<[CalendarView, string]> = [
  ["month", "Month"],
  ["week", "Week"],
  ["day", "Day"],
];

export default function Toolbar({
  view,
  cursor,
  onView,
  onPrev,
  onNext,
  onToday,
  onNew,
}: {
  view: CalendarView;
  cursor: Date;
  onView: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNew: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" onClick={onToday}>
          Today
        </Button>
        <button
          type="button"
          aria-label={`Previous ${view}`}
          onClick={onPrev}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label={`Next ${view}`}
          onClick={onNext}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent active:scale-95"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
      <h1
        aria-live="polite"
        className="min-w-0 flex-1 truncate text-2xl font-bold tracking-[-0.02em] md:text-3xl"
      >
        {viewTitle(view, cursor)}
      </h1>
      <div
        role="group"
        aria-label="Calendar view"
        className="flex rounded-md border p-0.5"
      >
        {VIEWS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => onView(id)}
            className={cn(
              "h-9 rounded-[4px] px-3 text-[15px] font-semibold transition-colors",
              view === id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <Button type="button" onClick={onNew} className="gap-1.5">
        <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        New task
      </Button>
    </div>
  );
}
