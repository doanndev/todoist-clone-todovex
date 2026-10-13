"use client";
import EmptyState from "@/components/todos/empty-state";
import PageHeader from "@/components/nav/page-header";
import TaskSkeleton from "@/components/todos/task-skeleton";
import Todos from "@/components/todos/todos";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { listItems } from "@/lib/agenda";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function Search() {
  const { searchQuery } = useParams<{ searchQuery: string }>();
  const query = safeDecode(searchQuery ?? "");

  const results = useQuery(api.search.searchTasks, { query });
  const items = useMemo(() => listItems(results ?? []), [results]);
  const open =
    results === undefined
      ? undefined
      : items.filter((item) => !item.isCompleted);

  return (
    <>
      <PageHeader title="Search" meta={`Results for "${query}"`} />
      {open === undefined ? (
        <TaskSkeleton />
      ) : open.length === 0 ? (
        <EmptyState title="No open tasks match.">
          Search looks through task names and descriptions. Try a shorter word.
        </EmptyState>
      ) : (
        <Todos items={open} />
      )}
    </>
  );
}
