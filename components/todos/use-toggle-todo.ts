"use client";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { TodoItem } from "@/lib/agenda";
import { useToast } from "../ui/use-toast";

/**
 * Ticks or unticks a row. A repeat of a repeating task is ticked on its own;
 * a plain task has one done flag.
 */
export function useToggleTodo() {
  const { toast } = useToast();
  const checkATodo = useMutation(api.todos.checkATodo);
  const unCheckATodo = useMutation(api.todos.unCheckATodo);
  const setOccurrenceDone = useMutation(api.todos.setOccurrenceDone);

  return (task: TodoItem) => {
    const done = !task.isCompleted;
    if (task.occurrenceKey !== undefined) {
      setOccurrenceDone({ taskId: task._id, key: task.occurrenceKey, done });
    } else if (done) {
      checkATodo({ taskId: task._id });
    } else {
      unCheckATodo({ taskId: task._id });
    }
    if (done) {
      toast({
        title: "Task completed",
        description: task.taskName,
        duration: 3000,
      });
    }
  };
}
