/* What a typed project or label name means, shared by Spotlight and the task form. */
import type { Doc } from "@/convex/_generated/dataModel";
import type { Resolution } from "./quick-add";
import { projectName } from "./swatch";

// A system project answers to both of its names.
export const projectNames = (p: Doc<"projects">) =>
  p.type === "system" ? [projectName(p), p.name] : [p.name];

export const labelNames = (l: Doc<"labels">) => [l.name];

/** The error message for a typed project or label that cannot be resolved. */
export function problemWith<T>(
  kind: string,
  typed: string | null,
  res: Resolution<T>,
  display: (item: T) => string,
) {
  if (res.status === "none") {
    return `No ${kind} named "${typed}". Pick one from the list.`;
  }
  if (res.status === "ambiguous") {
    const names = res.candidates.map(display).join(", ");
    return `"${typed}" matches several ${kind}s: ${names}. Be more specific.`;
  }
  return null;
}
