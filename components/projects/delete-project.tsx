import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { EllipsisIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { Id } from "@/convex/_generated/dataModel";

export default function DeleteProject({
  projectId,
}: {
  projectId: Id<"projects">;
}) {
  const { toast } = useToast();
  const router = useRouter();

  const deleteProject = useAction(api.projects.deleteProjectAndItsTasks);
  const project = useQuery(api.projects.getProjectByProjectId, { projectId });

  const onDelete = async () => {
    if (project?.type === "system") {
      toast({
        title: "Unfiled cannot be deleted",
        description: "System projects are protected.",
        duration: 3000,
      });
      return;
    }

    const deleted = await deleteProject({ projectId });

    if (deleted) {
      toast({ title: "Project deleted", duration: 3000 });
      router.push(`/loggedin/projects`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Project actions"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent active:scale-95"
      >
        <EllipsisIcon className="h-5 w-5" strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={onDelete}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          Delete project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
