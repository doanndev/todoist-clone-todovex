import type { CSSProperties } from "react";
import { COLOR_NAMES, type ColorName } from "@/convex/colors";
import type { Doc } from "@/convex/_generated/dataModel";

/*
  The swatch palette: washed-out pastels, one per project. Every pair keeps
  WCAG AA, and each has a dark-theme twin so strips never glare on a dark
  ground. Colour files a project; the project's name is always printed beside
  it, so nothing depends on telling hues apart.
*/
export type Swatch = {
  name: ColorName;
  bg: string;
  fg: string;
  bgDark: string;
  fgDark: string;
};

export const SWATCHES: Swatch[] = [
  {
    name: "Red",
    bg: "#FDEBEC",
    fg: "#9F2F2D",
    bgDark: "#3B2527",
    fgDark: "#F4B8B5",
  },
  {
    name: "Blue",
    bg: "#E1F3FE",
    fg: "#1F6C9F",
    bgDark: "#1F3342",
    fgDark: "#9ECBEA",
  },
  {
    name: "Green",
    bg: "#EDF3EC",
    fg: "#346538",
    bgDark: "#243329",
    fgDark: "#A9D1AE",
  },
  {
    name: "Yellow",
    bg: "#FBF3DB",
    fg: "#956400",
    bgDark: "#3A3320",
    fgDark: "#E6C97A",
  },
  {
    name: "Purple",
    bg: "#F1EAFB",
    fg: "#6B3FA0",
    bgDark: "#302742",
    fgDark: "#CDB6EA",
  },
  {
    name: "Teal",
    bg: "#E2F4F2",
    fg: "#1D6A64",
    bgDark: "#1F3535",
    fgDark: "#9AD3CE",
  },
  {
    name: "Pink",
    bg: "#FCE9F3",
    fg: "#9E2F65",
    bgDark: "#3C2532",
    fgDark: "#EFB3D0",
  },
  {
    name: "Orange",
    bg: "#FCEADB",
    fg: "#9A4A10",
    bgDark: "#3C2D20",
    fgDark: "#EDBB8F",
  },
];

// System projects (Unfiled) are a neutral grey chip, not a colour.
export const GREY: Swatch = {
  name: "Grey",
  bg: "#F1F1EF",
  fg: "#37352F",
  bgDark: "#26282A",
  fgDark: "#D7D8D3",
};

/** Sets the four custom properties that SWATCH_CLASS reads. */
export function swatchStyle(
  swatch: Pick<Swatch, "bg" | "fg" | "bgDark" | "fgDark">,
): CSSProperties {
  return {
    "--sw-bg": swatch.bg,
    "--sw-fg": swatch.fg,
    "--sw-bg-dark": swatch.bgDark,
    "--sw-fg-dark": swatch.fgDark,
  } as CSSProperties;
}

/** Pairs with swatchStyle(): pastel in light, muted twin in dark. */
export const SWATCH_CLASS =
  "bg-[color:var(--sw-bg)] text-[color:var(--sw-fg)] dark:bg-[color:var(--sw-bg-dark)] dark:text-[color:var(--sw-fg-dark)]";

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** What a project or label can be filed under, in the order the picker shows them. */
const swatchNamed = (name: ColorName) =>
  [...SWATCHES, GREY].find((s) => s.name === name)!;

export const PALETTE: Swatch[] = COLOR_NAMES.map(swatchNamed);

export function swatchByName(name?: ColorName | null) {
  return PALETTE.find((s) => s.name === name);
}

/**
 * Resolves every project's colour. A colour the user picked always wins.
 * Projects without one (older ones) fall back to a colour from the pastel
 * ring, stepping to the next free one, in creation order among themselves so
 * their colours never shift when other projects are added. System projects
 * (Inbox) are grey.
 */
export function assignSwatches(projects: Doc<"projects">[]) {
  const map = new Map<string, Swatch>();
  const used = new Set<number>();
  const sorted = [...projects].sort(
    (a, b) => a._creationTime - b._creationTime,
  );

  for (const project of sorted) {
    const chosen = swatchByName(project.color);
    if (chosen) {
      map.set(project._id, chosen);
      continue;
    }
    if (project.type === "system") {
      map.set(project._id, GREY);
      continue;
    }
    let index = hash(project._id) % SWATCHES.length;
    if (used.size < SWATCHES.length) {
      while (used.has(index)) index = (index + 1) % SWATCHES.length;
    }
    used.add(index);
    map.set(project._id, SWATCHES[index]);
  }
  return map;
}

/** The first palette colour not in `taken`, to pre-select in a picker. */
export function suggestColour(
  taken: Swatch[],
  pool: Swatch[] = PALETTE.filter((s) => s !== GREY),
) {
  const names = new Set(taken.map((s) => s.name));
  return pool.find((s) => !names.has(s.name)) ?? pool[0];
}

/**
 * The system project is shown as "Unfiled" so it is never confused with the
 * Inbox view, which lists every open task across all projects.
 */
export function projectName(
  project?: Pick<Doc<"projects">, "name" | "type"> | null,
) {
  if (!project) return "";
  return project.type === "system" ? "Unfiled" : project.name;
}

/** Five-step priority scale, stored as 1 to 5. 1 is the default and shows nothing. */
export const PRIORITIES = [
  "Lowest",
  "Low",
  "Medium",
  "High",
  "Urgent",
] as const;

export function priorityLevel(priority?: number) {
  const level = Math.round(priority ?? 1);
  return Math.min(PRIORITIES.length, Math.max(1, level));
}

export function priorityName(priority?: number) {
  return PRIORITIES[priorityLevel(priority) - 1];
}

/**
 * Priority reads as heat: grey, blue, amber, orange, red. `bar` is the solid
 * colour for bars and dots (3:1 on its ground); bg/fg tint a text chip.
 */
export type PriorityTone = Omit<Swatch, "name"> & {
  name: string;
  bar: string;
  barDark: string;
};

const tone = (
  name: string,
  base: ColorName,
  bar: string,
  barDark: string,
): PriorityTone => ({ ...swatchNamed(base), name, bar, barDark });

export const PRIORITY_TONES: PriorityTone[] = [
  tone("Lowest", "Grey", "#9B9A97", "#787774"),
  tone("Low", "Blue", "#3E8FC7", "#5FA8DB"),
  tone("Medium", "Yellow", "#C99200", "#D9A91C"),
  tone("High", "Orange", "#E0701B", "#EE8B3D"),
  tone("Urgent", "Red", "#D43B36", "#EC6A64"),
];

export function priorityTone(priority?: number) {
  return PRIORITY_TONES[priorityLevel(priority) - 1];
}

/** Sets the properties read by TONE_CLASS (tinted chip) and BAR_CLASS (solid). */
export function toneStyle(tone: PriorityTone): CSSProperties {
  return {
    ...swatchStyle(tone),
    "--pr-bar": tone.bar,
    "--pr-bar-dark": tone.barDark,
  } as CSSProperties;
}

export const BAR_CLASS =
  "bg-[color:var(--pr-bar)] dark:bg-[color:var(--pr-bar-dark)]";

/**
 * Fallback colours for labels without a picked one. Red, orange and yellow
 * are left out because they already mean urgency in the priority ramp.
 */
export const LABEL_COLOURS: Swatch[] = (
  ["Teal", "Purple", "Green", "Pink", "Blue"] as ColorName[]
).map(swatchNamed);

/**
 * A colour the user picked wins. Labels without one take the ring in creation
 * order among themselves, so adding a coloured label never recolours them.
 */
export function assignLabelColours(labels: Doc<"labels">[]) {
  const map = new Map<string, Swatch>();
  let auto = 0;
  [...labels]
    .sort((a, b) => a._creationTime - b._creationTime)
    .forEach((label) => {
      const chosen = swatchByName(label.color);
      if (chosen) {
        map.set(label._id, chosen);
      } else {
        map.set(label._id, LABEL_COLOURS[auto++ % LABEL_COLOURS.length]);
      }
    });
  return map;
}
