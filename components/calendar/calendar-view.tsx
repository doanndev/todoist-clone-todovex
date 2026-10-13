"use client";
import { useQuery } from "convex/react";
import moment from "moment";
import { useMemo, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { projectOccurrence } from "@/lib/agenda";
import {
  moveCursor,
  visibleDays,
  type CalendarView as View,
} from "@/lib/calendar";
import {
  currentOccurrence,
  occurrencesBetween,
  startOfDay,
} from "@/lib/schedule";
import { defaultSchedule, type ScheduleValue } from "@/lib/schedule-form";
import { useSwatches } from "@/lib/use-swatches";
import TaskDetailsDialog from "../add-tasks/task-details-dialog";
import AddTaskInline from "../add-tasks/add-task-inline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import MonthGrid from "./month-grid";
import TimeGrid from "./time-grid";
import Toolbar from "./toolbar";
import type { CalEvent } from "./types";

export default function CalendarView() {
  const todos = useQuery(api.todos.get);
  const swatchOf = useSwatches();

  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<{
    taskId: Id<"todos">;
    key: number;
  } | null>(null);
  const [creating, setCreating] = useState<ScheduleValue | null>(null);

  const days = useMemo(() => visibleDays(view, cursor), [view, cursor]);

  const events = useMemo<CalEvent[]>(() => {
    const from = startOfDay(days[0].getTime());
    const to = moment(days[days.length - 1])
      .add(1, "day")
      .startOf("day")
      .valueOf();
    return (todos ?? []).flatMap((task) =>
      occurrencesBetween(task, from, to).map((occ) => ({
        id: `${task._id}-${occ.start}`,
        item: projectOccurrence(task, occ),
        occ,
      })),
    );
  }, [todos, days]);

  const eventSwatch = (event: CalEvent) => swatchOf(event.item.projectId);

  // The open task is looked up again on every render so edits show at once.
  const openItem = useMemo(() => {
    if (!selected || !todos) return null;
    const task = todos.find((t) => t._id === selected.taskId);
    if (!task) return null;
    const occ =
      occurrencesBetween(
        task,
        selected.key,
        moment(selected.key).add(1, "day").valueOf(),
      )[0] ?? currentOccurrence(task, Date.now()).occurrence;
    return projectOccurrence(task, occ);
  }, [selected, todos]);

  const openDay = (day: Date) => {
    setCursor(day);
    setView("day");
  };

  const createTimed = (startMs: number, endMs: number) => {
    const start = moment(startMs);
    const end = moment(endMs);
    setCreating({
      ...defaultSchedule(start.toDate(), {
        allDay: false,
        startTime: start.format("HH:mm"),
        endTime: end.format("HH:mm"),
      }),
      endDate: end.clone().startOf("day").toDate(),
    });
  };

  return (
    <>
      <Toolbar
        view={view}
        cursor={cursor}
        onView={setView}
        onPrev={() => setCursor((c) => moveCursor(view, c, -1))}
        onNext={() => setCursor((c) => moveCursor(view, c, 1))}
        onToday={() => setCursor(new Date())}
        onNew={() => setCreating(defaultSchedule(cursor))}
      />

      {view === "month" ? (
        <MonthGrid
          days={days}
          cursor={cursor}
          events={events}
          swatchOf={eventSwatch}
          onCreate={(day) => setCreating(defaultSchedule(day))}
          onOpen={(e) => setSelected({ taskId: e.item._id, key: e.occ.key })}
          onOpenDay={openDay}
        />
      ) : (
        <TimeGrid
          days={days}
          events={events}
          swatchOf={eventSwatch}
          onCreate={createTimed}
          onCreateAllDay={(day) => setCreating(defaultSchedule(day))}
          onOpen={(e) => setSelected({ taskId: e.item._id, key: e.occ.key })}
          onOpenDay={openDay}
        />
      )}

      <Dialog
        open={selected !== null && openItem !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {openItem && <TaskDetailsDialog data={openItem} />}
      </Dialog>

      <Dialog
        open={creating !== null}
        onOpenChange={(open) => !open && setCreating(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold tracking-tight">
              New task
            </DialogTitle>
            <DialogDescription className="sr-only">
              Name the task, then set when it happens and whether it repeats.
            </DialogDescription>
          </DialogHeader>
          {creating && (
            <AddTaskInline
              variant="dialog"
              setShowAddTask={() => setCreating(null)}
              initialSchedule={creating}
              onDone={() => setCreating(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
