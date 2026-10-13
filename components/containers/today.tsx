"use client";
import { api } from "@/convex/_generated/api";
import { agendaFor } from "@/lib/agenda";
import { useQuery } from "convex/react";
import moment from "moment";
import { useMemo } from "react";
import { AddTaskWrapper } from "../add-tasks/add-task-button";
import PageHeader from "../nav/page-header";
import EmptyState from "../todos/empty-state";
import TaskSkeleton from "../todos/task-skeleton";
import OverdueSection from "../todos/overdue-section";
import Todos from "../todos/todos";

export default function Today() {
  const todos = useQuery(api.todos.get);
  const loading = todos === undefined;
  const { today, overdue } = useMemo(() => agendaFor(todos ?? []), [todos]);

  return (
    <>
      <PageHeader
        title="Today"
        meta={loading ? undefined : moment().format("dddd D MMMM")}
      />
      {loading ? (
        <TaskSkeleton />
      ) : (
        <>
          <OverdueSection items={overdue} />
          <section aria-labelledby="due-today">
            <h2
              id="due-today"
              className="mb-1 text-sm font-semibold text-muted-foreground"
            >
              Due today
            </h2>
            {today.length === 0 ? (
              <EmptyState title="Nothing due today.">
                Tasks scheduled for today, and repeats that fall today, appear
                here.
              </EmptyState>
            ) : (
              <Todos items={today} />
            )}
          </section>
        </>
      )}
      <AddTaskWrapper />
    </>
  );
}
