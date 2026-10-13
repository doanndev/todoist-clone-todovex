import { useState } from "react";
import type { TodoItem } from "@/lib/agenda";
import { describeRecurrence } from "@/lib/schedule";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TaskRow from "../todos/task-row";
import { useToggleTodo } from "../todos/use-toggle-todo";
import { AddTaskWrapper } from "./add-task-button";
import AddTaskInline from "./add-task-inline";
import { useToast } from "../ui/use-toast";
import DueDate from "../todos/due-date";
import LabelTag from "../todos/label-tag";
import PriorityBars from "../todos/priority-bars";
import PriorityChip from "../todos/priority-chip";
import ProjectChip from "../todos/project-chip";

export default function TaskDetailsDialog({ data }: { data: TodoItem }) {
  const { taskName, description, projectId, labelId, priority, _id } = data;
  // For one repeat of a repeating task, `data` carries that repeat's dates and
  // `task` is the stored series, which is what editing changes.
  const task = data.source ?? data;
  const [editing, setEditing] = useState(false);
  const project = useQuery(api.projects.getProjectByProjectId, { projectId });
  const label = useQuery(api.labels.getLabelByLabelId, { labelId });

  const { toast } = useToast();
  const toggle = useToggleTodo();

  const inCompletedSubtodosByProject =
    useQuery(api.subTodos.inCompleteSubTodos, { parentId: _id }) ?? [];

  const completedSubtodosByProject =
    useQuery(api.subTodos.completedSubTodos, { parentId: _id }) ?? [];

  const checkASubTodoMutation = useMutation(api.subTodos.checkASubTodo);
  const unCheckASubTodoMutation = useMutation(api.subTodos.unCheckASubTodo);

  const deleteATodoMutation = useMutation(api.todos.deleteATodo);

  const handleDeleteTodo = async () => {
    await deleteATodoMutation({ taskId: _id });
    toast({ title: "Task deleted", description: taskName, duration: 3000 });
  };

  if (editing) {
    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Edit task
          </DialogTitle>
          <DialogDescription
            className={task.recurrence ? undefined : "sr-only"}
          >
            {task.recurrence
              ? "Changes apply to every repeat of this task."
              : "Change what, when and where this task lives."}
          </DialogDescription>
        </DialogHeader>
        <AddTaskInline
          variant="dialog"
          editTask={task}
          setShowAddTask={() => setEditing(false)}
          onDone={() => setEditing(false)}
        />
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-3xl gap-0 p-0 md:grid md:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="p-6 md:p-8">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-2xl font-bold leading-tight tracking-tight">
            {taskName}
          </DialogTitle>
          <DialogDescription className="text-base">
            {description || "No description."}
          </DialogDescription>
        </DialogHeader>

        <section aria-label="Sub-tasks" className="mt-8">
          <h3 className="border-b pb-2 text-sm font-semibold text-muted-foreground">
            Sub-tasks
          </h3>
          {inCompletedSubtodosByProject.map((task) => (
            <TaskRow
              key={task._id}
              data={task}
              isCompleted={task.isCompleted}
              showProject={false}
              showLabel={false}
              handleOnChange={() => checkASubTodoMutation({ taskId: task._id })}
            />
          ))}
          <AddTaskWrapper parentTask={task} />
          {completedSubtodosByProject.map((task) => (
            <TaskRow
              key={task._id}
              data={task}
              isCompleted={task.isCompleted}
              showProject={false}
              showLabel={false}
              handleOnChange={() =>
                unCheckASubTodoMutation({ taskId: task._id })
              }
            />
          ))}
        </section>
      </div>

      <aside className="flex flex-col gap-5 border-t bg-muted/60 p-6 md:border-l md:border-t-0 md:p-8">
        <dl className="space-y-5 text-sm">
          <div>
            <dt className="mb-1.5 font-semibold text-muted-foreground">
              Project
            </dt>
            <dd>
              <ProjectChip project={project} />
            </dd>
          </div>
          <div>
            <dt className="mb-1.5 font-semibold text-muted-foreground">When</dt>
            <dd className="space-y-1">
              <DueDate task={data} isCompleted={data.isCompleted} />
              {task.recurrence && (
                <p className="text-muted-foreground">
                  {describeRecurrence(task.recurrence, task.dueDate)}
                </p>
              )}
            </dd>
          </div>
          <div>
            <dt className="mb-1.5 font-semibold text-muted-foreground">
              Priority
            </dt>
            <dd className="flex items-center gap-2">
              <PriorityChip priority={priority} />
              <PriorityBars priority={priority} />
            </dd>
          </div>
          <div>
            <dt className="mb-1.5 font-semibold text-muted-foreground">
              Label
            </dt>
            <dd>{label ? <LabelTag label={label} /> : "None"}</dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => toggle(data)}
            className="justify-start gap-2"
          >
            <Check className="h-4 w-4" strokeWidth={1.75} />
            {data.isCompleted ? "Mark not done" : "Mark done"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(true)}
            className="justify-start gap-2"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
            Edit task
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDeleteTodo}
            className="justify-start gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            Delete task
          </Button>
        </div>
      </aside>
    </DialogContent>
  );
}
