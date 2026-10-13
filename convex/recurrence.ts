import { Infer, v } from "convex/values";

// How a task repeats. Timestamps are milliseconds; `byWeekday` uses 0 = Sunday
// to 6 = Saturday. `until` and `count` are alternatives (neither means forever).
export const recurrenceValidator = v.object({
  freq: v.union(
    v.literal("daily"),
    v.literal("weekly"),
    v.literal("monthly"),
    v.literal("yearly"),
  ),
  interval: v.number(),
  byWeekday: v.optional(v.array(v.number())),
  until: v.optional(v.number()),
  count: v.optional(v.number()),
});

export type Recurrence = Infer<typeof recurrenceValidator>;

/** True when two rules repeat identically (both absent counts as the same). */
export function sameRecurrence(a?: Recurrence | null, b?: Recurrence | null) {
  if (!a || !b) return !a && !b;
  const days = (rule: Recurrence) => (rule.byWeekday ?? []).join(",");
  return (
    a.freq === b.freq &&
    a.interval === b.interval &&
    a.until === b.until &&
    a.count === b.count &&
    days(a) === days(b)
  );
}
