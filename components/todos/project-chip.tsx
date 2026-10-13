"use client";
import type { Doc } from "@/convex/_generated/dataModel";
import { useSwatches } from "@/lib/use-swatches";
import { projectName, SWATCH_CLASS, swatchStyle } from "@/lib/swatch";

export default function ProjectChip({
  project,
}: {
  project?: Doc<"projects"> | null;
}) {
  const swatchOf = useSwatches();
  if (!project) return null;
  const swatch = swatchOf(project._id);
  return (
    <span
      className={`${SWATCH_CLASS} inline-block max-w-[9rem] truncate rounded-[3px] px-2 py-0.5 text-xs font-semibold`}
      style={swatchStyle(swatch)}
    >
      {projectName(project)}
    </span>
  );
}
