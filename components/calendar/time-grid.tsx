"use client";
import moment from "moment";
import { useEffect, useRef, useState } from "react";

import { layoutDay } from "@/lib/calendar";
import { formatSpan } from "@/lib/schedule";
import { SWATCH_CLASS, swatchStyle, type Swatch } from "@/lib/swatch";
import { cn } from "@/lib/utils";
import { dayRange, eventsOnDay, type CalEvent } from "./types";

const HOUR_PX = 52;
const GUTTER = "3.5rem";
const HOURS = Array.from({ length: 24 }, (_, h) => h);

/** The week and day views: an all-day strip above a 24 hour grid. */
export default function TimeGrid({
  days,
  events,
  swatchOf,
  onCreate,
  onCreateAllDay,
  onOpen,
  onOpenDay,
}: {
  days: Date[];
  events: CalEvent[];
  swatchOf: (event: CalEvent) => Swatch;
  onCreate: (startMs: number, endMs: number) => void;
  onCreateAllDay: (day: Date) => void;
  onOpen: (event: CalEvent) => void;
  onOpenDay: (day: Date) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const firstDay = days[0].getTime();
  const showsToday = days.some((d) => moment(d).isSame(now, "day"));
  // Start the scroll an hour above "now", or at 7:00 when today is not shown.
  useEffect(() => {
    if (!scroller.current) return;
    const hour = showsToday ? Math.max(0, moment().hour() - 1) : 7;
    scroller.current.scrollTop = Math.max(0, hour * HOUR_PX - 10);
  }, [firstDay, days.length, showsToday]);

  const columns = `${GUTTER} repeat(${days.length}, minmax(0, 1fr))`;
  const wide = days.length > 1;

  return (
    <div className="overflow-x-auto rounded-md border">
      <div className={cn(wide && "min-w-[720px]")}>
        {/* Day headings */}
        <div
          className="grid border-b bg-muted/60"
          style={{ gridTemplateColumns: columns }}
        >
          <div />
          {days.map((day) => {
            const m = moment(day);
            const isToday = m.isSame(now, "day");
            return (
              <div key={day.toISOString()} className="border-l px-2 py-2">
                <button
                  type="button"
                  onClick={() => onOpenDay(day)}
                  aria-label={`Open ${m.format("dddd D MMMM")}`}
                  className="flex items-baseline gap-1.5 rounded-[3px] px-1 hover:bg-accent"
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {m.format("ddd")}
                  </span>
                  <span
                    className={cn(
                      "rounded-[3px] px-1.5 text-lg font-bold tabular-nums",
                      isToday && "bg-foreground text-background",
                    )}
                  >
                    {m.date()}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* All-day strip */}
        <div className="grid border-b" style={{ gridTemplateColumns: columns }}>
          <div className="px-2 py-1.5 text-right text-xs text-muted-foreground">
            All day
          </div>
          {days.map((day) => {
            const allDay = eventsOnDay(events, day).filter((e) => e.occ.allDay);
            return (
              <div
                key={day.toISOString()}
                onClick={() => onCreateAllDay(day)}
                className="min-h-[2.25rem] cursor-pointer space-y-0.5 border-l p-1 hover:bg-accent/40"
              >
                {allDay.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    title={formatSpan(event.item)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(event);
                    }}
                    style={swatchStyle(swatchOf(event))}
                    className={cn(
                      SWATCH_CLASS,
                      "block w-full truncate rounded-[3px] px-1.5 py-0.5 text-left text-xs font-semibold",
                      event.occ.done && "line-through opacity-60",
                    )}
                  >
                    {event.item.taskName}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Hours */}
        <div
          ref={scroller}
          className="max-h-[calc(100dvh-17rem)] min-h-[20rem] overflow-y-auto"
        >
          <div
            className="grid"
            style={{ gridTemplateColumns: columns, height: 24 * HOUR_PX }}
          >
            <div className="relative" aria-hidden>
              {HOURS.slice(1).map((h) => (
                <span
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-xs tabular-nums text-muted-foreground"
                  style={{ top: h * HOUR_PX }}
                >
                  {String(h).padStart(2, "0")}:00
                </span>
              ))}
            </div>
            {days.map((day) => (
              <DayColumn
                key={day.toISOString()}
                day={day}
                now={now}
                events={eventsOnDay(events, day).filter((e) => !e.occ.allDay)}
                swatchOf={swatchOf}
                onCreate={onCreate}
                onOpen={onOpen}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  day,
  now,
  events,
  swatchOf,
  onCreate,
  onOpen,
}: {
  day: Date;
  now: number;
  events: CalEvent[];
  swatchOf: (event: CalEvent) => Swatch;
  onCreate: (startMs: number, endMs: number) => void;
  onOpen: (event: CalEvent) => void;
}) {
  const [dayStart, dayEnd] = dayRange(day);
  const placed = layoutDay(
    events.map((event) => ({
      item: event,
      start: Math.max(event.occ.start, dayStart),
      end: Math.min(event.occ.end, dayEnd),
    })),
  );
  const isToday = moment(day).isSame(now, "day");
  const toPx = (ms: number) => ((ms - dayStart) / 3_600_000) * HOUR_PX;

  return (
    <div
      className={cn(
        "relative cursor-pointer border-l",
        isToday && "bg-accent/30",
      )}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const half = Math.floor(((event.clientY - rect.top) / HOUR_PX) * 2);
        const start = moment(dayStart)
          .add(half * 30, "minutes")
          .valueOf();
        onCreate(start, start + 60 * 60 * 1000);
      }}
    >
      {HOURS.map((h) => (
        <div
          key={h}
          aria-hidden
          className={cn("absolute inset-x-0 border-t", h === 0 && "border-t-0")}
          style={{ top: h * HOUR_PX }}
        />
      ))}

      {placed.map(({ item: event, start, end, column, columns }) => {
        const height = Math.max(20, toPx(end) - toPx(start) - 2);
        return (
          <button
            key={event.id}
            type="button"
            aria-label={`${event.item.taskName}, ${formatSpan(event.item)}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(event);
            }}
            style={{
              ...swatchStyle(swatchOf(event)),
              top: toPx(start) + 1,
              height,
              left: `calc(${(column / columns) * 100}% + 2px)`,
              width: `calc(${100 / columns}% - 4px)`,
            }}
            className={cn(
              SWATCH_CLASS,
              "absolute z-[1] overflow-hidden rounded-[3px] border-l-[3px] border-[color:var(--sw-fg)] px-1.5 py-0.5 text-left text-xs dark:border-[color:var(--sw-fg-dark)]",
              event.occ.done && "line-through opacity-60",
            )}
          >
            <span className="block truncate font-semibold">
              {event.item.taskName}
            </span>
            {height >= 38 && (
              <span className="block truncate tabular-nums opacity-80">
                {moment(event.occ.start).format("HH:mm")}
                {"-"}
                {moment(event.occ.end).format("HH:mm")}
              </span>
            )}
          </button>
        );
      })}

      {isToday && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-[2] h-0.5 bg-destructive"
          style={{ top: toPx(now) - 1 }}
        >
          <span className="absolute -left-1 -top-[3px] h-2 w-2 rounded-[2px] bg-destructive" />
        </div>
      )}
    </div>
  );
}
