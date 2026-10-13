"use client";
import { Tag } from "lucide-react";

import { useLabelColours } from "@/lib/use-label-colours";
import { SWATCH_CLASS, swatchStyle, type Swatch } from "@/lib/swatch";
import { cn } from "@/lib/utils";

/** A label as a tag icon plus its name on a tinted background. */
export default function LabelTag({
  label,
  colour,
  className,
}: {
  label?: { _id: string; name: string } | null;
  /** Overrides the label's own colour, for a preview before it is saved. */
  colour?: Swatch;
  className?: string;
}) {
  const colourOf = useLabelColours();
  if (!label) return null;
  return (
    <span
      className={cn(
        SWATCH_CLASS,
        "inline-flex max-w-[10rem] items-center gap-1.5 rounded-[3px] px-2 py-0.5 text-xs font-semibold",
        className,
      )}
      style={swatchStyle(colour ?? colourOf(label._id))}
    >
      <Tag aria-hidden className="h-3 w-3 shrink-0" strokeWidth={1.75} />
      <span className="truncate">{label.name}</span>
    </span>
  );
}
