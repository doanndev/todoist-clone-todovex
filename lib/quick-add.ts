/*
  Quick-add syntax for the Spotlight box: `+task name#project#label`.
  Everything here is pure so it can be reasoned about (and tested) without React.
*/

export type QuickAdd = {
  name: string;
  /** null when the segment is absent or left empty. */
  project: string | null;
  label: string | null;
  /** Which segment the user is typing in: 0 name, 1 project, 2 label. */
  segment: 0 | 1 | 2;
  /** More than two `#` were typed. */
  tooMany: boolean;
};

/** Parses the text after the leading `+`. */
export function parseQuickAdd(raw: string): QuickAdd {
  const parts = raw.split("#");
  const clean = (value: string | undefined) => {
    const trimmed = value?.trim() ?? "";
    return trimmed === "" ? null : trimmed;
  };

  return {
    name: (parts[0] ?? "").trim(),
    project: clean(parts[1]),
    label: clean(parts[2]),
    segment: Math.min(parts.length - 1, 2) as 0 | 1 | 2,
    tooMany: parts.length > 3,
  };
}

/** The text of the segment currently being typed (not trimmed at the start). */
export function currentSegmentText(raw: string) {
  const parts = raw.split("#");
  return parts[Math.min(parts.length - 1, 2)] ?? "";
}

/** Replaces the segment being typed with `value`; adds `#` to move to the next. */
export function completeSegment(raw: string, value: string) {
  const parts = raw.split("#");
  const index = Math.min(parts.length - 1, 2);
  const next = parts.slice(0, index);
  next.push(value);
  const joined = next.join("#");
  return index < 2 ? `${joined}#` : joined;
}

export type Resolution<T> =
  | { status: "empty" }
  | { status: "match"; item: T }
  | { status: "ambiguous"; candidates: T[] }
  | { status: "none" };

/**
 * Finds the item a typed word means. An exact name wins; otherwise a prefix,
 * then a substring, but only when it points at exactly one item. Never guesses
 * between several.
 */
export function resolveByName<T>(
  items: T[],
  query: string | null,
  namesOf: (item: T) => string[],
): Resolution<T> {
  const q = query?.trim().toLowerCase();
  if (!q) return { status: "empty" };

  const lowered = (item: T) => namesOf(item).map((n) => n.toLowerCase());

  const exact = items.filter((item) => lowered(item).includes(q));
  if (exact.length === 1) return { status: "match", item: exact[0] };

  const prefix = items.filter((item) =>
    lowered(item).some((n) => n.startsWith(q)),
  );
  if (prefix.length === 1) return { status: "match", item: prefix[0] };
  if (prefix.length > 1) return { status: "ambiguous", candidates: prefix };

  const partial = items.filter((item) =>
    lowered(item).some((n) => n.includes(q)),
  );
  if (partial.length === 1) return { status: "match", item: partial[0] };
  if (partial.length > 1) return { status: "ambiguous", candidates: partial };

  return { status: "none" };
}

/** Items whose names contain the typed text, for the suggestion list. */
export function suggest<T>(
  items: T[],
  query: string,
  namesOf: (item: T) => string[],
  limit = 6,
) {
  const q = query.trim().toLowerCase();
  const matches = q
    ? items.filter((item) =>
        namesOf(item).some((n) => n.toLowerCase().includes(q)),
      )
    : items;
  return matches.slice(0, limit);
}
