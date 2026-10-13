import type { TodoItem } from "@/lib/agenda";
import type { Occurrence } from "@/lib/schedule";

/** One occurrence of a task, placed on the calendar. */
export type CalEvent = {
  id: string;
  /** The row as the list pages show it: this occurrence's dates and done state. */
  item: TodoItem;
  occ: Occurrence;
};

export const dayRange = (day: Date) => {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start.getTime(), end.getTime()] as const;
};

/** Events that overlap a given day. */
export function eventsOnDay(events: CalEvent[], day: Date) {
  const [from, to] = dayRange(day);
  return events.filter((e) => e.occ.start < to && e.occ.end > from);
}
