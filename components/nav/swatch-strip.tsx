import Link from "next/link";
import { SWATCH_CLASS, swatchStyle, type Swatch } from "@/lib/swatch";
import { cn } from "@/lib/utils";

type SwatchStripProps = {
  name: string;
  swatch: Swatch;
  open: number;
  /** 0 to 1: how much of this project's work is done. */
  done: number;
  href?: string;
  active?: boolean;
  /** "lg" is the poster scale used on the landing page. */
  size?: "md" | "lg";
  /** Grow the fill bar from empty once on load (landing hero). */
  animateIn?: boolean;
  delay?: number;
  className?: string;
};

/**
 * One paint-chip strip. The bottom bar fills as tasks get done, and the active
 * strip is pulled out of the deck, so state never depends on colour alone.
 */
export default function SwatchStrip({
  name,
  swatch,
  open,
  done,
  href,
  active = false,
  size = "md",
  animateIn = false,
  delay = 0,
  className,
}: SwatchStripProps) {
  const large = size === "lg";
  const percent = Math.round(Math.min(1, Math.max(0, done)) * 100);

  const body = (
    <>
      <span
        className={cn(
          "min-w-0 truncate font-semibold leading-tight",
          large ? "text-xl sm:text-2xl" : "text-[15px]",
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "font-medium tabular-nums opacity-90",
          large ? "text-sm sm:text-base" : "text-[13px]",
        )}
      >
        {open} open
      </span>
      <span
        aria-hidden
        className={cn(
          "swatch-fill absolute bottom-0 left-0 bg-current opacity-30",
          animateIn && "swatch-fill-in",
          large ? "h-[7px]" : "h-[5px]",
        )}
        style={{
          width: `${percent}%`,
          ...(animateIn ? { animationDelay: `${delay + 250}ms` } : null),
        }}
      />
    </>
  );

  const classes = cn(
    SWATCH_CLASS,
    "relative flex items-end justify-between gap-3 rounded-l-[3px] px-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
    large ? "h-20 pb-4 sm:h-24 sm:px-6" : "h-14 pb-2.5",
    active ? "-translate-x-3 pr-7" : "hover:-translate-x-1.5",
    className,
  );
  const style = swatchStyle(swatch);

  if (!href) {
    return (
      <div className={classes} style={style}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      style={style}
      aria-current={active ? "page" : undefined}
      aria-label={`${name}, ${open} open, ${percent}% done`}
    >
      {body}
    </Link>
  );
}
