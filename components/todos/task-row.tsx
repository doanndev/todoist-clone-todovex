"use client";
import { useQuery } from "convex/react";
import { ReactNode } from "react";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { DialogTrigger } from "../ui/dialog";
import DueDate from "./due-date";
import LabelTag from "./label-tag";
import PriorityBars from "./priority-bars";
import ProjectChip from "./project-chip";

/**
 * One ruled row: checkbox, name, then project, priority and date. Used for
 * tasks (which open a details dialog) and for sub-tasks (which do not).
 */
export default function TaskRow({
  data,
  isCompleted,
  handleOnChange,
  showProject = true,
  showLabel = true,
  opensDialog = false,
}: {
  data: Doc<"todos"> | Doc<"subTodos">;
  isCompleted: boolean;
  handleOnChange: () => void;
  showProject?: boolean;
  showLabel?: boolean;
  /** Wrap the title in a DialogTrigger; the row must sit inside a Dialog. */
  opensDialog?: boolean;
}) {
  const { taskName, description, priority } = data;
  const projects = useQuery(api.projects.getProjects);
  const labels = useQuery(api.labels.getLabels);
  const label = showLabel
    ? labels?.find((l) => l._id === data.labelId)
    : undefined;
  const project = showProject
    ? projects?.find((p) => p._id === data.projectId)
    : null;

  const title = (children: ReactNode) =>
    opensDialog ? (
      <DialogTrigger asChild>
        <button type="button" className="min-w-0 flex-1 rounded-sm text-left">
          {children}
        </button>
      </DialogTrigger>
    ) : (
      <div className="min-w-0 flex-1 text-left">{children}</div>
    );

  return (
    <div className="animate-row-in border-b py-3">
      <div className="flex items-start gap-3">
        <Checkbox
          aria-label={
            isCompleted
              ? `Mark "${taskName}" as not done`
              : `Mark "${taskName}" as done`
          }
          className="mt-[3px]"
          checked={isCompleted}
          onCheckedChange={handleOnChange}
        />
        {title(
          <>
            <span
              className={cn(
                "block text-[17px] leading-snug",
                isCompleted
                  ? "font-normal text-muted-foreground line-through decoration-1"
                  : "font-semibold",
              )}
            >
              {taskName}
            </span>
            {description ? (
              <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                {description}
              </span>
            ) : null}
            <LabelTag label={label} className="mt-1.5" />
            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 sm:hidden">
              <ProjectChip project={project} />
              <DueDate task={data} isCompleted={isCompleted} />
              <PriorityBars priority={priority} />
            </span>
          </>,
        )}
        <div className="hidden shrink-0 items-center gap-4 pt-0.5 sm:flex">
          <ProjectChip project={project} />
          <span className="flex w-[25px] justify-end">
            <PriorityBars priority={priority} />
          </span>
          <DueDate
            task={data}
            isCompleted={isCompleted}
            className="min-w-[5.5rem] justify-end"
          />
        </div>
      </div>
    </div>
  );
}
