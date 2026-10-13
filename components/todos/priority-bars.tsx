import {
  BAR_CLASS,
  priorityLevel,
  priorityName,
  priorityTone,
  toneStyle,
} from "@/lib/swatch";
import { cn } from "@/lib/utils";

const HEIGHTS = ["h-1", "h-1.5", "h-2", "h-3", "h-4"];

/** Five-step ramp. Level 1 (lowest) is the default and draws nothing. */
export default function PriorityBars({ priority }: { priority?: number }) {
  const level = priorityLevel(priority);
  if (level === 1) return null;

  return (
    <span
      role="img"
      aria-label={`Priority: ${priorityName(priority)}`}
      className="flex h-4 items-end gap-[2.5px]"
      style={toneStyle(priorityTone(priority))}
    >
      {HEIGHTS.map((height, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-[1px]",
            height,
            i < level ? BAR_CLASS : "bg-border",
          )}
        />
      ))}
    </span>
  );
}
