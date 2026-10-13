"use client";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { assignSwatches } from "@/lib/swatch";
import { Dialog, DialogTrigger } from "../ui/dialog";
import NameColourDialog from "../ui/name-colour-dialog";
import { useToast } from "../ui/use-toast";

export default function AddProjectDialog({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName} aria-label="Add a project">
        <PlusIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </DialogTrigger>
      <AddProjectDialogContent onDone={() => setOpen(false)} />
    </Dialog>
  );
}

function AddProjectDialogContent({ onDone }: { onDone: () => void }) {
  const projects = useQuery(api.projects.getProjects);
  const { toast } = useToast();
  const router = useRouter();
  const createAProject = useMutation(api.projects.createAProject);

  return (
    <NameColourDialog
      title="New project"
      description="Each project gets its own colour in the sidebar."
      noun="Project"
      submitLabel="Create project"
      taken={Array.from(assignSwatches(projects ?? []).values())}
      onCreate={async (name, color) => {
        const projectId = await createAProject({ name, color });
        if (projectId) {
          toast({
            title: "Project created",
            description: name,
            duration: 3000,
          });
          onDone();
          router.push(`/loggedin/projects/${projectId}`);
        }
        return !!projectId;
      }}
    />
  );
}
