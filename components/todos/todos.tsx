import React from "react";
import Task from "./task";
import type { TodoItem } from "@/lib/agenda";
import { useToggleTodo } from "./use-toggle-todo";

export default function Todos({ items }: { items: Array<TodoItem> }) {
  const toggle = useToggleTodo();

  return items.map((task) => (
    <Task
      key={`${task._id}-${task.occurrenceKey ?? ""}`}
      data={task}
      isCompleted={task.isCompleted}
      handleOnChange={() => toggle(task)}
    />
  ));
}
