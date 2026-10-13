/*
  Turns stored tasks into the rows the list pages show. A repeating task is
  stored once; here it becomes a row for the repeat that matters on that page.
*/
import moment from "moment";

import type { Doc } from "@/convex/_generated/dataModel";
import {
  currentOccurrence,
  lastMissedOccurrence,
  occurrencesBetween,
  spanOf,
  startOfDay,
  type Occurrence,
} from "./schedule";

export type TodoItem = Doc<"todos"> & {
  /** Set on rows that stand for one repeat of a repeating task. */
  occurrenceKey?: number;
  /** The stored task, which the row's dates were taken from. */
  source?: Doc<"todos">;
};

/** The task as one occurrence: its dates and done state come from `occ`. */
export function projectOccurrence(
  task: Doc<"todos">,
  occ: Occurrence,
): TodoItem {
  return {
    ...task,
    dueDate: occ.start,
    endDate: occ.allDay
      ? moment(occ.end).subtract(1, "day").valueOf()
      : occ.end,
    isCompleted: occ.done,
    // Only a repeat is ticked on its own; a plain task has one done flag.
    occurrenceKey: task.recurrence ? occ.key : undefined,
    source: task,
  };
}

/** One row per task. A repeating task shows the repeat that is up next. */
export function listItems(todos: Doc<"todos">[], now = Date.now()): TodoItem[] {
  return todos.map((task) => {
    if (!task.recurrence) return task;
    const { occurrence, finished } = currentOccurrence(task, now);
    return projectOccurrence(task, { ...occurrence, done: finished });
  });
}

const UPCOMING_DAYS = 60;

export function agendaFor(todos: Doc<"todos">[], now = Date.now()) {
  const todayStart = startOfDay(now);
  const tomorrowStart = moment(todayStart).add(1, "day").valueOf();
  const horizon = moment(tomorrowStart).add(UPCOMING_DAYS, "days").valueOf();

  const today: TodoItem[] = [];
  const overdue: TodoItem[] = [];
  const byDay = new Map<number, TodoItem[]>();

  for (const task of todos) {
    for (const occ of occurrencesBetween(task, todayStart, tomorrowStart)) {
      today.push(projectOccurrence(task, occ));
    }
    if (
      !task.recurrence &&
      !task.isCompleted &&
      spanOf(task).end <= todayStart
    ) {
      overdue.push(task);
    }
    const missed = lastMissedOccurrence(task, now);
    if (missed) overdue.push(projectOccurrence(task, missed));
    for (const occ of occurrencesBetween(task, tomorrowStart, horizon)) {
      // A span already running today is listed under Today, not again here.
      if (occ.start < tomorrowStart) continue;
      const day = startOfDay(occ.start);
      byDay.set(day, [...(byDay.get(day) ?? []), projectOccurrence(task, occ)]);
    }
  }

  const byStart = (a: TodoItem, b: TodoItem) => a.dueDate - b.dueDate;
  today.sort(byStart);
  overdue.sort(byStart);
  const upcoming = Array.from(byDay.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([day, items]) => [day, items.sort(byStart)] as [number, TodoItem[]]);

  return { today, overdue, upcoming };
}

/** One row per task, split into what is still open and what is done. */
export function partitionItems(todos: Doc<"todos">[], now = Date.now()) {
  const items = listItems(todos, now);
  return {
    open: items.filter((item) => !item.isCompleted),
    done: items.filter((item) => item.isCompleted),
  };
}

/** Open and total task counts per project, for the strips. */
export function projectStats(todos: Doc<"todos">[]) {
  const byProject = new Map<string, { open: number; total: number }>();
  for (const todo of todos) {
    const entry = byProject.get(todo.projectId) ?? { open: 0, total: 0 };
    entry.total += 1;
    if (!todo.isCompleted) entry.open += 1;
    byProject.set(todo.projectId, entry);
  }
  return byProject;
}
