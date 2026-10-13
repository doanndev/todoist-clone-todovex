"use client";
import type { TodoItem } from "@/lib/agenda";
import TaskDetailsDialog from "../add-tasks/task-details-dialog";
import { Dialog } from "../ui/dialog";
import TaskRow from "./task-row";

/** A task row in a list; its title opens the details dialog. */
export default function Task({
  data,
  isCompleted,
  handleOnChange,
}: {
  data: TodoItem;
  isCompleted: boolean;
  handleOnChange: () => void;
}) {
  return (
    <Dialog>
      <TaskRow
        data={data}
        isCompleted={isCompleted}
        handleOnChange={handleOnChange}
        opensDialog
      />
      <TaskDetailsDialog data={data} />
    </Dialog>
  );
}
