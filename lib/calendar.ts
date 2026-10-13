/* Date ranges and event layout for the calendar views. Pure, local time. */
import moment from "moment";

export type CalendarView = "month" | "week" | "day";

/** Weeks start on Monday. */
export const weekStart = (date: Date) =>
  moment(date).startOf("isoWeek").toDate();

export function visibleDays(view: CalendarView, cursor: Date): Date[] {
  const first =
    view === "day"
      ? moment(cursor).startOf("day")
      : view === "week"
        ? moment(cursor).startOf("isoWeek")
        : moment(cursor).startOf("month").startOf("isoWeek");
  const count = view === "day" ? 1 : view === "week" ? 7 : 42;
  return Array.from({ length: count }, (_, i) =>
    first.clone().add(i, "days").toDate(),
  );
}

export function moveCursor(view: CalendarView, cursor: Date, step: 1 | -1) {
  const unit = view === "month" ? "months" : view === "week" ? "weeks" : "days";
  return moment(cursor).add(step, unit).toDate();
}

export function viewTitle(view: CalendarView, cursor: Date) {
  const m = moment(cursor);
  if (view === "month") return m.format("MMMM YYYY");
  if (view === "day") return m.format("dddd D MMMM YYYY");
  const a = m.clone().startOf("isoWeek");
  const b = a.clone().add(6, "days");
  if (a.isSame(b, "month"))
    return `${a.format("D")}-${b.format("D MMMM YYYY")}`;
  if (a.isSame(b, "year"))
    return `${a.format("D MMM")} - ${b.format("D MMM YYYY")}`;
  return `${a.format("D MMM YYYY")} - ${b.format("D MMM YYYY")}`;
}

export type Placed<T> = {
  item: T;
  start: number;
  end: number;
  /** Which column of its overlap group, and how many columns the group has. */
  column: number;
  columns: number;
};

const MIN_VISIBLE = 30 * 60 * 1000;

/**
 * Lays out events that share a day column. Events that overlap are split into
 * side-by-side columns; events that do not overlap keep the full width.
 */
export function layoutDay<T>(
  events: Array<{ item: T; start: number; end: number }>,
): Placed<T>[] {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  const placed: Placed<T>[] = [];
  let group: Placed<T>[] = [];
  let groupEnd = -Infinity;
  const columnEnds: number[] = [];

  const flush = () => {
    for (const p of group) p.columns = columnEnds.length;
    placed.push(...group);
    group = [];
    columnEnds.length = 0;
    groupEnd = -Infinity;
  };

  for (const e of sorted) {
    // A tiny event still takes room on screen, so it counts as 30 minutes.
    const visibleEnd = Math.max(e.end, e.start + MIN_VISIBLE);
    if (e.start >= groupEnd && group.length) flush();
    let column = columnEnds.findIndex((end) => end <= e.start);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = visibleEnd;
    group.push({ ...e, end: visibleEnd, column, columns: 1 });
    groupEnd = Math.max(groupEnd, visibleEnd);
  }
  flush();
  return placed;
}
