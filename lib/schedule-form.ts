/*
  The task form edits a schedule as plain parts (dates, "HH:mm" strings, a
  repeat choice). These helpers convert between that and the stored fields.
*/
import moment from "moment";

import { spanOf, type Recurrence, type Schedulable } from "./schedule";

export type Repeat = "none" | Recurrence["freq"];
export type Ends = "never" | "until" | "count";

export type ScheduleValue = {
  allDay: boolean;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  repeat: Repeat;
  interval: number;
  weekdays: number[];
  ends: Ends;
  until: Date;
  count: number;
};

export type ScheduleFields = {
  dueDate: number;
  endDate?: number;
  allDay: boolean;
  recurrence?: Recurrence;
};

const combine = (date: Date, time: string) => {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return moment(date)
    .startOf("day")
    .hour(Number.isFinite(h) ? h : 0)
    .minute(Number.isFinite(m) ? m : 0)
    .valueOf();
};

export function defaultSchedule(
  day: Date = new Date(),
  opts: { allDay?: boolean; startTime?: string; endTime?: string } = {},
): ScheduleValue {
  const startTime = opts.startTime ?? "09:00";
  return {
    allDay: opts.allDay ?? true,
    startDate: day,
    startTime,
    endDate: day,
    endTime:
      opts.endTime ?? moment(startTime, "HH:mm").add(1, "hour").format("HH:mm"),
    repeat: "none",
    interval: 1,
    weekdays: [],
    ends: "never",
    until: moment(day).add(1, "month").toDate(),
    count: 10,
  };
}

export function scheduleFromTask(task: Schedulable): ScheduleValue {
  const span = spanOf(task);
  const base = defaultSchedule(new Date(span.start));
  const rule = task.recurrence;
  const repeat = rule
    ? {
        repeat: rule.freq,
        interval: rule.interval,
        weekdays: rule.byWeekday ?? [],
        ends: (rule.until != null
          ? "until"
          : rule.count != null
            ? "count"
            : "never") as Ends,
        until: rule.until != null ? new Date(rule.until) : base.until,
        count: rule.count ?? base.count,
      }
    : {};

  if (span.allDay) {
    return {
      ...base,
      ...repeat,
      allDay: true,
      endDate: moment(span.end).subtract(1, "day").toDate(),
    };
  }
  return {
    ...base,
    ...repeat,
    allDay: false,
    startDate: new Date(span.start),
    startTime: moment(span.start).format("HH:mm"),
    endDate: new Date(span.end),
    endTime: moment(span.end).format("HH:mm"),
  };
}

/**
 * Applies an edit. Moving the start carries the end along, so the length of
 * the event stays the same, as in Google Calendar.
 */
export function applyScheduleChange(
  prev: ScheduleValue,
  patch: Partial<ScheduleValue>,
): ScheduleValue {
  const next = { ...prev, ...patch };
  const startMoved =
    patch.startDate !== undefined || patch.startTime !== undefined;
  if (
    startMoved &&
    patch.endDate === undefined &&
    patch.endTime === undefined
  ) {
    if (prev.allDay && next.allDay) {
      const days = moment(prev.endDate)
        .startOf("day")
        .diff(moment(prev.startDate).startOf("day"), "days");
      next.endDate = moment(next.startDate).add(days, "days").toDate();
    } else {
      const delta =
        combine(next.startDate, next.startTime) -
        combine(prev.startDate, prev.startTime);
      const end = moment(combine(prev.endDate, prev.endTime) + delta);
      next.endDate = end.clone().startOf("day").toDate();
      next.endTime = end.format("HH:mm");
    }
  }
  return next;
}

export function scheduleToFields(
  v: ScheduleValue,
): { ok: true; fields: ScheduleFields } | { ok: false; error: string } {
  let dueDate: number;
  let endDate: number | undefined;

  if (v.allDay) {
    dueDate = moment(v.startDate).startOf("day").valueOf();
    const last = moment(v.endDate).startOf("day").valueOf();
    if (last < dueDate)
      return { ok: false, error: "The end is before the start." };
    endDate = last === dueDate ? undefined : last;
  } else {
    dueDate = combine(v.startDate, v.startTime);
    endDate = combine(v.endDate, v.endTime);
    if (endDate <= dueDate) {
      return { ok: false, error: "The end must be after the start." };
    }
  }

  let recurrence: Recurrence | undefined;
  if (v.repeat !== "none") {
    const interval = Math.floor(v.interval);
    if (!Number.isFinite(interval) || interval < 1 || interval > 999) {
      return { ok: false, error: "Repeat every needs a number from 1 to 999." };
    }
    recurrence = { freq: v.repeat, interval };
    if (v.repeat === "weekly") {
      recurrence.byWeekday = v.weekdays.length
        ? Array.from(new Set(v.weekdays)).sort()
        : [moment(dueDate).day()];
    }
    if (v.ends === "until") {
      const until = moment(v.until).startOf("day").valueOf();
      if (until < moment(dueDate).startOf("day").valueOf()) {
        return { ok: false, error: "The repeat ends before it starts." };
      }
      recurrence.until = until;
    } else if (v.ends === "count") {
      const count = Math.floor(v.count);
      if (!Number.isFinite(count) || count < 1 || count > 999) {
        return {
          ok: false,
          error: "Repeat count needs a number from 1 to 999.",
        };
      }
      recurrence.count = count;
    }
  }

  return {
    ok: true,
    fields: { dueDate, endDate, allDay: v.allDay, recurrence },
  };
}
