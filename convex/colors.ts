import { Infer, v } from "convex/values";

// The palette a project or label can be filed under. This validator is the one
// list: the names below are read from it, and lib/swatch.ts maps each name to
// a swatch.
export const colorValidator = v.union(
  v.literal("Red"),
  v.literal("Orange"),
  v.literal("Yellow"),
  v.literal("Green"),
  v.literal("Teal"),
  v.literal("Blue"),
  v.literal("Purple"),
  v.literal("Pink"),
  v.literal("Grey"),
);

export type ColorName = Infer<typeof colorValidator>;

export const COLOR_NAMES: ColorName[] = colorValidator.members.map(
  (member) => member.value,
);
