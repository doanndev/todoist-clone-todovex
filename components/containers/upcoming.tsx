"use client";
import { api } from "@/convex/_generated/api";
import { agendaFor } from "@/lib/agenda";
import { dayLabel, isNearDay } from "@/lib/schedule";
import { useQuery } from "convex/react";
import moment from "moment";
import { useMemo } from "react";
import { AddTaskWrapper } from "../add-tasks/add-task-button";
import PageHeader from "../nav/page-header";
import EmptyState from "../todos/empty-state";
import TaskSkeleton from "../todos/task-skeleton";
import OverdueSection from "../todos/overdue-section";
import Todos from "../todos/todos";

export default function Upcoming() {
  const todos = useQuery(api.todos.get);
  const loading = todos === undefined;
  const { overdue, upcoming } = useMemo(() => agendaFor(todos ?? []), [todos]);

  return (
    <>
      <PageHeader
        title="Upcoming"
        meta={loading ? undefined : "The next 60 days, soonest first"}
      />
      {loading ? (
        <TaskSkeleton />
      ) : (
        <>
          <OverdueSection items={overdue} />
          {upcoming.length === 0 ? (
            <EmptyState title="Nothing scheduled.">
              Tasks from tomorrow on, including repeats, are grouped by day
              here.
            </EmptyState>
          ) : (
            upcoming.map(([day, items]) => (
              <section key={day} className="mb-8">
                <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
                  {dayLabel(day)}
                  {/* Only "Today"-style labels need the date spelled out. */}
                  {isNearDay(day) && (
                    <span className="font-normal">
                      {" "}
                      {moment(day).format("D MMMM")}
                    </span>
                  )}
                </h2>
                <Todos items={items} />
              </section>
            ))
          )}
        </>
      )}
      <AddTaskWrapper />
    </>
  );
}
