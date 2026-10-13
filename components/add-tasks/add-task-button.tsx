import { Plus } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import AddTaskInline from "./add-task-inline";
import { Doc, Id } from "@/convex/_generated/dataModel";

export const AddTaskWrapper = ({
  parentTask,
  projectId,
}: {
  parentTask?: Doc<"todos">;
  projectId?: Id<"projects">;
}) => {
  const [showAddTask, setShowAddTask] = useState(false);

  return showAddTask ? (
    <AddTaskInline
      setShowAddTask={setShowAddTask}
      parentTask={parentTask}
      projectId={projectId}
      variant={parentTask ? "plain" : "card"}
    />
  ) : (
    <AddTaskButton
      onClick={() => setShowAddTask(true)}
      title={parentTask?._id ? "Add sub-task" : "Add task"}
    />
  );
};

export default function AddTaskButton({
  onClick,
  title,
}: {
  onClick: Dispatch<SetStateAction<any>>;
  title: string;
}) {
  return (
    <button
      type="button"
      className="group -mx-2 mt-1 flex w-[calc(100%+1rem)] items-center gap-3 rounded-md px-2 py-3 text-left text-[15px] font-semibold transition-colors hover:bg-accent"
      onClick={onClick}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-[3px] border-[1.5px] border-input transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </span>
      {title}
    </button>
  );
}
