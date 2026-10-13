"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import moment from "moment";
import { useMemo } from "react";
import { partitionItems } from "@/lib/agenda";
import { AddTaskWrapper } from "../add-tasks/add-task-button";
import PageHeader from "../nav/page-header";
import CompletedTodos from "./completed-todos";
import EmptyState from "./empty-state";
import TaskSkeleton from "./task-skeleton";
import Todos from "./todos";

export default function TodoList() {
  const todos = useQuery(api.todos.get);
  const loading = todos === undefined;

  const { open, done } = useMemo(() => partitionItems(todos ?? []), [todos]);

  return (
    <>
      <PageHeader
        title="Inbox"
        meta={
          loading
            ? undefined
            : `${moment().format("dddd D MMMM")}, ${open.length} open`
        }
      />
      {loading ? (
        <TaskSkeleton />
      ) : open.length === 0 ? (
        <EmptyState title="Nothing open right now.">
          Add a task below. Give it a project and a due date and it will show up
          in Today and Upcoming.
        </EmptyState>
      ) : (
        <Todos items={open} />
      )}
      <AddTaskWrapper />
      <CompletedTodos totalTodos={done.length}>
        <Todos items={done} />
      </CompletedTodos>
    </>
  );
}
