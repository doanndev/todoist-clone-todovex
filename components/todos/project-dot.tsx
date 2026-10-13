"use client";
import { swatchStyle } from "@/lib/swatch";
import { useSwatches } from "@/lib/use-swatches";

/** A small square in a project's colour, for menus. The name is printed beside it. */
export default function ProjectDot({ projectId }: { projectId: string }) {
  const swatchOf = useSwatches();
  return (
    <span
      aria-hidden
      className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[color:var(--sw-fg)] dark:bg-[color:var(--sw-fg-dark)]"
      style={swatchStyle(swatchOf(projectId))}
    />
  );
}
