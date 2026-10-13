"use client";
import { Check } from "lucide-react";
import { useId } from "react";

import type { ColorName } from "@/convex/colors";
import { PALETTE, swatchStyle } from "@/lib/swatch";
import { cn } from "@/lib/utils";

/**
 * A row of colour swatches. Native radio inputs under the hood, so the arrow
 * keys, focus and screen readers work without extra code. Every swatch is
 * named, so colour is never the only cue.
 */
export default function ColorPicker({
  value,
  onChange,
  label = "Colour",
}: {
  value: ColorName;
  onChange: (name: ColorName) => void;
  label?: string;
}) {
  const group = useId();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {PALETTE.map((swatch) => (
          <label
            key={swatch.name}
            title={swatch.name}
            className="relative cursor-pointer"
          >
            <input
              type="radio"
              name={group}
              value={swatch.name}
              checked={value === swatch.name}
              onChange={() => onChange(swatch.name)}
              aria-label={swatch.name}
              className="peer sr-only"
            />
            <span
              style={swatchStyle(swatch)}
              className={cn(
                "bg-[color:var(--sw-fg)] text-[color:var(--sw-bg)] dark:bg-[color:var(--sw-fg-dark)] dark:text-[color:var(--sw-bg-dark)]",
                "flex h-8 w-8 items-center justify-center rounded-md transition-transform",
                "peer-checked:ring-2 peer-checked:ring-foreground peer-checked:ring-offset-2 peer-checked:ring-offset-background",
                "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
                "hover:scale-105 active:scale-95",
              )}
            >
              {value === swatch.name && (
                <Check aria-hidden className="h-4 w-4" strokeWidth={2.5} />
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
