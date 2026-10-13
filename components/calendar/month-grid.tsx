"use client";
import moment from "moment";

import { formatSpan } from "@/lib/schedule";
import { SWATCH_CLASS, swatchStyle, type Swatch } from "@/lib/swatch";
import { cn } from "@/lib/utils";
import { eventsOnDay, type CalEvent } from "./types";

const MAX_CHIPS = 3;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MonthGrid({
  days,
  cursor,
  events,
  swatchOf,
  onCreate,
  onOpen,
  onOpenDay,
}: {
  days: Date[];
  cursor: Date;
  events: CalEvent[];
  swatchOf: (event: CalEvent) => Swatch;
  onCreate: (day: Date) => void;
  onOpen: (event: CalEvent) => void;
  onOpenDay: (day: Date) => void;
}) {
  const today = moment();

  return (
    <div className="rounded-md border">
      <div>
        <div className="grid grid-cols-7 border-b bg-muted/60">
          {WEEKDAYS.map((name) => (
            <div
              key={name}
              className="px-2 py-2 text-xs font-semibold text-muted-foreground"
            >
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const m = moment(day);
            const dayEvents = eventsOnDay(events, day).sort(
              (a, b) =>
                Number(b.occ.allDay) - Number(a.occ.allDay) ||
                a.occ.start - b.occ.start,
            );
            const shown = dayEvents.slice(0, MAX_CHIPS);
            const more = dayEvents.length - shown.length;
            const isToday = m.isSame(today, "day");
            const inMonth = m.isSame(cursor, "month");
            const lastRow = index >= 35;

            return (
              <div
                key={day.toISOString()}
                onClick={() =>
                  // On a phone a tap opens the day; there is no room to add here.
                  window.innerWidth < 640 ? onOpenDay(day) : onCreate(day)
                }
                className={cn(
                  "min-h-[4.5rem] cursor-pointer border-r p-0.5 sm:min-h-[6.75rem] sm:p-1 transition-colors hover:bg-accent/40",
                  !lastRow && "border-b",
                  index % 7 === 6 && "border-r-0",
                  !inMonth && "bg-muted/40",
                )}
              >
                <div className="mb-1 flex">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenDay(day);
                    }}
                    aria-label={`Open ${m.format("dddd D MMMM")}`}
                    className={cn(
                      "min-w-[1.75rem] rounded-[3px] px-1.5 py-0.5 text-sm font-semibold tabular-nums hover:bg-accent",
                      isToday &&
                        "bg-foreground text-background hover:bg-foreground",
                      !inMonth && !isToday && "text-muted-foreground",
                    )}
                  >
                    {m.date() === 1 ? m.format("D MMM") : m.date()}
                  </button>
                </div>
                <ul className="space-y-0.5">
                  {shown.map((event) => {
                    const swatch = swatchOf(event);
                    const done = event.occ.done;
                    return (
                      <li key={event.id}>
                        <button
                          type="button"
                          title={formatSpan(event.item)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpen(event);
                          }}
                          style={swatchStyle(swatch)}
                          className={cn(
                            "flex w-full items-center gap-1 truncate rounded-[3px] px-1.5 py-0.5 text-left text-xs font-semibold",
                            // Phones show each task as a thin colour bar.
                            "max-sm:h-1.5 max-sm:bg-[color:var(--sw-fg)] max-sm:p-0 dark:max-sm:bg-[color:var(--sw-fg-dark)]",
                            event.occ.allDay ? SWATCH_CLASS : "hover:bg-accent",
                            done && "line-through opacity-60",
                          )}
                        >
                          <span className="contents max-sm:hidden">
                            {!event.occ.allDay && (
                              <>
                                <span
                                  aria-hidden
                                  className="h-2 w-2 shrink-0 rounded-[2px] bg-[color:var(--sw-fg)] dark:bg-[color:var(--sw-fg-dark)]"
                                />
                                <span className="shrink-0 font-normal tabular-nums text-muted-foreground">
                                  {moment(event.occ.start).format("HH:mm")}
                                </span>
                              </>
                            )}
                            <span className="truncate">
                              {event.item.taskName}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {more > 0 && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenDay(day);
                    }}
                    className="mt-0.5 rounded-[3px] px-1.5 py-0.5 text-xs font-semibold text-muted-foreground max-sm:px-0.5 hover:bg-accent hover:text-foreground"
                  >
                    +{more} more
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
