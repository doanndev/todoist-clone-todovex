"use client";
import { ReactNode, useState } from "react";

import type { ColorName } from "@/convex/colors";
import ColorPicker from "./color-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/**
 * Wraps any trigger in a popover holding the colour palette. Picking a colour
 * saves it and closes the popover.
 */
export default function ColorPopover({
  value,
  onPick,
  align = "start",
  children,
}: {
  value: ColorName;
  onPick: (name: ColorName) => void | Promise<unknown>;
  align?: "start" | "end";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-auto max-w-[19rem] p-4">
        <ColorPicker
          value={value}
          onChange={async (name) => {
            await onPick(name);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
