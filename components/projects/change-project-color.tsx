"use client";
import { useMutation } from "convex/react";
import { Palette } from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useSwatches } from "@/lib/use-swatches";
import ColorPopover from "../ui/color-popover";
import { useToast } from "../ui/use-toast";

/** A palette button for the project page header. Hidden for the system project. */
export default function ChangeProjectColor({
  projectId,
  project,
}: {
  projectId: Id<"projects">;
  project?: Doc<"projects"> | null;
}) {
  const swatch = useSwatches()(projectId);
  const update = useMutation(api.projects.updateProjectColor);
  const { toast } = useToast();

  if (!project || project.type === "system") return null;

  return (
    <ColorPopover
      align="end"
      value={swatch.name}
      onPick={async (name) => {
        const done = await update({
          projectId,
          color: name,
        });
        if (!done) toast({ title: "Colour not changed", duration: 3000 });
      }}
    >
      <button
        type="button"
        aria-label={`Change colour, now ${swatch.name}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent active:scale-95"
      >
        <Palette className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </ColorPopover>
  );
}
