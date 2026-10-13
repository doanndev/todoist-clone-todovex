import * as React from "react";

import { cn } from "@/lib/utils";

/** The look shared by every property control in the task form. */
export const chipClass =
  "inline-flex h-9 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98] data-[state=open]:border-foreground aria-[invalid=true]:border-destructive";

export const Chip = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(chipClass, className)}
    {...props}
  />
));
Chip.displayName = "Chip";
