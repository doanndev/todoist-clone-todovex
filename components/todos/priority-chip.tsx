import {
  PRIORITY_TONES,
  SWATCH_CLASS,
  BAR_CLASS,
  priorityTone,
  toneStyle,
} from "@/lib/swatch";
import { cn } from "@/lib/utils";

/** The priority name on its tint, e.g. a red "Urgent". Lowest stays grey. */
export default function PriorityChip({ priority }: { priority?: number }) {
  const tone = priorityTone(priority);
  return (
    <span
      className={cn(
        SWATCH_CLASS,
        "inline-block rounded-[3px] px-2 py-0.5 text-xs font-semibold",
      )}
      style={toneStyle(tone)}
    >
      {tone.name}
    </span>
  );
}

/** A solid dot in a level's colour, for menus. */
export function PriorityDot({ level }: { level: number }) {
  const tone = PRIORITY_TONES[level - 1];
  return (
    <span
      aria-hidden
      className={cn("h-2 w-2 shrink-0 rounded-[2px]", BAR_CLASS)}
      style={toneStyle(tone)}
    />
  );
}
