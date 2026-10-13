/*
  Scheduling for tasks: a time span (all-day or timed) that may repeat.

  A task stores `dueDate` as the start of its span, `endDate` as its end, and
  `allDay`. Older tasks only have `dueDate`, which reads as a single all-day
  date. For an all-day task `endDate` is the last day, inclusive. Repeats are
  never stored; they are generated from `recurrence` for whatever range is on
  screen. Everything here is pure and uses the local time zone.
*/
import moment from "moment";

export type Recurrence = {
  freq: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  byWeekday?: number[];
  until?: number;
  count?: number;
};

export type Schedulable = {
  dueDate: number;
  endDate?: number;
  allDay?: boolean;
  recurrence?: Recurrence;
  completedOccurrences?: number[];
  isCompleted: boolean;
};

export type Span = {
  start: number;
  /** Exclusive: for all-day, the start of the day after the last day. */
  end: number;
  allDay: boolean;
};

export type Occurrence = Span & {
  /** Start of the day the occurrence begins on; identifies it for ticking. */
  key: number;
  done: boolean;
};

const HOUR = 60 * 60 * 1000;
const MAX_STEPS = 10000;

export const startOfDay = (ms: number) => moment(ms).startOf("day").valueOf();

export function spanOf(task: Schedulable): Span {
  if (task.allDay === false) {
    const start = task.dueDate;
    let end = task.endDate ?? start + HOUR;
    if (end <= start) end = start + HOUR;
    return { start, end, allDay: false };
  }
  const first = moment(task.dueDate).startOf("day");
  let last = moment(task.endDate ?? task.dueDate).startOf("day");
  if (last.isBefore(first)) last = first.clone();
  return {
    start: first.valueOf(),
    end: last.add(1, "day").valueOf(),
    allDay: true,
  };
}

/**
 * Calls `visit` with the start of every repeat, in order, until the rule runs
 * out or `visit` returns false.
 */
function eachRepeatStart(
  rule: Recurrence,
  baseStart: number,
  visit: (start: number) => boolean | void,
) {
  const base = moment(baseStart);
  const interval = Math.max(1, Math.floor(rule.interval || 1));
  const untilEnd =
    rule.until != null ? moment(rule.until).endOf("day").valueOf() : Infinity;
  const maxCount = rule.count ?? Infinity;
  let emitted = 0;

  // Returns false once the rule is exhausted.
  const ok = (ms: number) => ms <= untilEnd && emitted < maxCount;

  if (rule.freq === "daily") {
    for (let k = 0; k < MAX_STEPS; k++) {
      const ms = base
        .clone()
        .add(k * interval, "days")
        .valueOf();
      if (!ok(ms)) return;
      emitted++;
      if (visit(ms) === false) return;
    }
  } else if (rule.freq === "weekly") {
    const days = Array.from(
      new Set(rule.byWeekday?.length ? rule.byWeekday : [base.day()]),
    )
      .map((d) => (d + 6) % 7) // Monday = 0
      .sort((a, b) => a - b);
    const week0 = base.clone().startOf("isoWeek");
    for (let w = 0; w < MAX_STEPS; w++) {
      for (const offset of days) {
        const ms = week0
          .clone()
          .add(w * interval, "weeks")
          .add(offset, "days")
          .hour(base.hour())
          .minute(base.minute())
          .valueOf();
        if (ms < baseStart) continue;
        if (!ok(ms)) return;
        emitted++;
        if (visit(ms) === false) return;
      }
    }
  } else {
    const unit = rule.freq === "monthly" ? "months" : "years";
    for (let k = 0; k < MAX_STEPS; k++) {
      const m = base.clone().add(k * interval, unit);
      // A repeat on the 31st skips months without one, as Google Calendar does.
      if (m.date() !== base.date()) continue;
      const ms = m.valueOf();
      if (!ok(ms)) return;
      emitted++;
      if (visit(ms) === false) return;
    }
  }
}

function toOccurrence(
  span: Span,
  start: number,
  done: Set<number>,
): Occurrence {
  const end = span.allDay
    ? moment(start)
        .add(moment(span.end).diff(span.start, "days"), "days")
        .valueOf()
    : start + (span.end - span.start);
  const key = startOfDay(start);
  return { start, end, allDay: span.allDay, key, done: done.has(key) };
}

/** Every occurrence that overlaps [from, to). */
export function occurrencesBetween(
  task: Schedulable,
  from: number,
  to: number,
): Occurrence[] {
  const span = spanOf(task);

  if (!task.recurrence) {
    if (span.start < to && span.end > from) {
      return [
        {
          ...span,
          key: startOfDay(span.start),
          done: task.isCompleted,
        },
      ];
    }
    return [];
  }

  const done = new Set(task.completedOccurrences ?? []);
  const found: Occurrence[] = [];
  eachRepeatStart(task.recurrence, span.start, (start) => {
    if (start >= to) return false;
    const occ = toOccurrence(span, start, done);
    if (occ.end > from) found.push(occ);
  });
  return found;
}

/**
 * The occurrence a list should show for a task: the first one that is not
 * ticked and has not fully passed. `finished` is true when a finite series has
 * nothing left, in which case `occurrence` is its last repeat.
 */
export function currentOccurrence(
  task: Schedulable,
  now: number,
): { occurrence: Occurrence; finished: boolean } {
  const span = spanOf(task);
  if (!task.recurrence) {
    return {
      occurrence: {
        ...span,
        key: startOfDay(span.start),
        done: task.isCompleted,
      },
      finished: task.isCompleted,
    };
  }

  const done = new Set(task.completedOccurrences ?? []);
  const today = startOfDay(now);
  let last: Occurrence | null = null;
  let current: Occurrence | null = null;
  eachRepeatStart(task.recurrence, span.start, (start) => {
    const occ = toOccurrence(span, start, done);
    last = occ;
    if (!occ.done && occ.end > today) {
      current = occ;
      return false;
    }
  });
  if (current) return { occurrence: current, finished: false };
  return {
    occurrence: last ?? toOccurrence(span, span.start, done),
    finished: last !== null && (last as Occurrence).done,
  };
}

/**
 * The most recent unticked repeat that ended before today, within `lookback`
 * days, so a missed repeat can show as overdue without a daily habit piling up
 * a row for every day. Null for a task that does not repeat.
 */
export function lastMissedOccurrence(
  task: Schedulable,
  now: number,
  lookback = 7,
): Occurrence | null {
  if (!task.recurrence) return null;
  const today = startOfDay(now);
  const from = moment(today).subtract(lookback, "days").valueOf();
  const missed = occurrencesBetween(task, from, today).filter(
    (occ) => !occ.done && occ.end <= today,
  );
  return missed.length ? missed[missed.length - 1] : null;
}

// ---- Wording -------------------------------------------------------------

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const weekdayShort = (d: number) => WEEKDAYS[d];

/** "Today", "Tomorrow", "Yesterday", else a short date. */
export function dayLabel(ms: number, now = Date.now()) {
  const day = moment(ms).startOf("day");
  const diff = day.diff(moment(now).startOf("day"), "days");
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return day.format(
    day.year() === moment(now).year() ? "ddd D MMM" : "D MMM YYYY",
  );
}

/** True for yesterday, today and tomorrow, which dayLabel names in words. */
export function isNearDay(ms: number, now = Date.now()) {
  const diff = moment(ms)
    .startOf("day")
    .diff(moment(now).startOf("day"), "days");
  return Math.abs(diff) <= 1;
}

/** "Today", "13-15 Oct", "Tue 13 Oct, 14:00-15:30" and so on. */
export function formatSpan(task: Schedulable, now = Date.now()) {
  const span = spanOf(task);
  if (span.allDay) {
    const lastDay = moment(span.end).subtract(1, "day");
    const firstDay = moment(span.start);
    if (lastDay.isSame(firstDay, "day")) return dayLabel(span.start, now);
    const sameMonth = lastDay.isSame(firstDay, "month");
    return sameMonth
      ? `${firstDay.format("D")}-${lastDay.format("D MMM")}`
      : `${firstDay.format("D MMM")} - ${lastDay.format("D MMM")}`;
  }
  const s = moment(span.start);
  const e = moment(span.end);
  if (s.isSame(e, "day")) {
    return `${dayLabel(span.start, now)}, ${s.format("HH:mm")}-${e.format("HH:mm")}`;
  }
  return `${s.format("D MMM HH:mm")} - ${e.format("D MMM HH:mm")}`;
}

export function describeRecurrence(rule: Recurrence, startMs: number) {
  const n = Math.max(1, Math.floor(rule.interval || 1));
  const start = moment(startMs);
  let text: string;
  switch (rule.freq) {
    case "daily":
      text = n === 1 ? "Every day" : `Every ${n} days`;
      break;
    case "weekly": {
      const days = (rule.byWeekday?.length ? rule.byWeekday : [start.day()])
        .slice()
        .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
        .map(weekdayShort)
        .join(", ");
      text = `${n === 1 ? "Every week" : `Every ${n} weeks`} on ${days}`;
      break;
    }
    case "monthly":
      text = `${n === 1 ? "Every month" : `Every ${n} months`} on day ${start.date()}`;
      break;
    default:
      text = `${n === 1 ? "Every year" : `Every ${n} years`} on ${start.format("D MMM")}`;
  }
  if (rule.until != null)
    text += `, until ${moment(rule.until).format("D MMM YYYY")}`;
  else if (rule.count != null)
    text += `, ${rule.count} ${rule.count === 1 ? "time" : "times"}`;
  return text;
}
