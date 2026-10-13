"use client";
import { AddTaskWrapper } from "@/components/add-tasks/add-task-button";
import PageHeader from "@/components/nav/page-header";
import ChangeProjectColor from "@/components/projects/change-project-color";
import DeleteProject from "@/components/projects/delete-project";
import CompletedTodos from "@/components/todos/completed-todos";
import EmptyState from "@/components/todos/empty-state";
import TaskSkeleton from "@/components/todos/task-skeleton";
import Todos from "@/components/todos/todos";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSwatches } from "@/lib/use-swatches";
import { projectName, SWATCH_CLASS, swatchStyle } from "@/lib/swatch";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { partitionItems } from "@/lib/agenda";

export default function ProjectIdPage() {
  const { projectId } = useParams<{ projectId: Id<"projects"> }>();

  const todos = useQuery(api.todos.getTodosByProjectId, { projectId });
  const lists = useMemo(() => partitionItems(todos ?? []), [todos]);
  const open = todos === undefined ? undefined : lists.open;
  const done = todos === undefined ? undefined : lists.done;
  const project = useQuery(api.projects.getProjectByProjectId, { projectId });

  const loading = open === undefined || done === undefined;
  const swatch = useSwatches()(projectId);

  return (
    <>
      <div
        className={`${SWATCH_CLASS} mb-4 h-3 rounded-[2px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]`}
        style={swatchStyle(swatch)}
        role="img"
        aria-label={`${swatch.name} swatch`}
      />
      <PageHeader
        title={projectName(project) || "Project"}
        meta={loading ? undefined : `${open.length} open, ${done.length} done`}
        actions={
          <div className="flex items-center">
            <ChangeProjectColor projectId={projectId} project={project} />
            <DeleteProject projectId={projectId} />
          </div>
        }
      />
      {loading ? (
        <TaskSkeleton />
      ) : open.length === 0 ? (
        <EmptyState title="No open tasks in this project.">
          Add one below, or pick another project from the sidebar.
        </EmptyState>
      ) : (
        <Todos items={open} />
      )}
      <AddTaskWrapper projectId={projectId} />
      <CompletedTodos totalTodos={done?.length ?? 0}>
        <Todos items={done ?? []} />
      </CompletedTodos>
    </>
  );
}
