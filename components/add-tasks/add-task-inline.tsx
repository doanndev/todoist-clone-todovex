"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "../ui/textarea";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { chipClass } from "../ui/chip";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  PRIORITIES,
  priorityLevel,
  projectName,
  swatchStyle,
} from "@/lib/swatch";
import { parseQuickAdd, resolveByName } from "@/lib/quick-add";
import { labelNames, problemWith, projectNames } from "@/lib/quick-resolve";
import { useLabelColours } from "@/lib/use-label-colours";
import { cn } from "@/lib/utils";
import LabelTag from "../todos/label-tag";
import ProjectDot from "../todos/project-dot";
import { PriorityDot } from "../todos/priority-chip";
import { api } from "@/convex/_generated/api";
import {
  applyScheduleChange,
  defaultSchedule,
  scheduleFromTask,
  scheduleToFields,
  type ScheduleValue,
} from "@/lib/schedule-form";
import { DateChip, RepeatChip } from "./schedule-fields";

const FormSchema = z.object({
  taskName: z.string().min(2, {
    message: "Task name must be at least 2 characters.",
  }),
  description: z.string().optional().default(""),
  priority: z.string().min(1, { message: "Please select a priority" }),
  projectId: z.string().min(1, { message: "Please select a Project" }),
  labelId: z.string().min(1, { message: "Please select a Label" }),
});

export default function AddTaskInline({
  setShowAddTask,
  parentTask,
  projectId: myProjectId,
  editTask,
  initialSchedule,
  onDone,
  variant = "card",
}: {
  setShowAddTask: Dispatch<SetStateAction<boolean>>;
  parentTask?: Doc<"todos">;
  projectId?: Id<"projects">;
  /** Edit this task instead of adding a new one. */
  editTask?: Doc<"todos">;
  /** Starting schedule for a new task, e.g. the slot clicked in the calendar. */
  initialSchedule?: ScheduleValue;
  /** Called after a task is saved. */
  onDone?: () => void;
  /**
   * `card` sits on a page, `plain` inside a list or dialog column, and
   * `dialog` is the whole body of a dialog that has its own title.
   */
  variant?: "card" | "plain" | "dialog";
}) {
  const { toast } = useToast();
  const labelColourOf = useLabelColours();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const projects = useQuery(api.projects.getProjects) ?? [];
  const labels = useQuery(api.labels.getLabels) ?? [];

  // Defaults come from the seeded system data (first system project = Inbox).
  const projectId =
    editTask?.projectId ||
    myProjectId ||
    parentTask?.projectId ||
    projects.find((p) => p.type === "system")?._id ||
    "";

  const labelId =
    editTask?.labelId || parentTask?.labelId || labels[0]?._id || "";
  const priority = (editTask ?? parentTask)?.priority?.toString() || "1";
  const parentId = parentTask?._id;

  const createASubTodo = useMutation(api.subTodos.createASubTodo);
  const createATodo = useMutation(api.todos.createATodo);
  const updateATodo = useMutation(api.todos.updateATodo);

  const startSchedule = () =>
    editTask
      ? scheduleFromTask(editTask)
      : initialSchedule ?? defaultSchedule();
  const [schedule, setSchedule] = useState<ScheduleValue>(startSchedule);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const defaultValues = {
    taskName: editTask?.taskName ?? "",
    description: editTask?.description ?? "",
    priority,
    projectId,
    labelId,
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  // Size the description to its text, including a long one loaded for editing.
  const descriptionText = form.watch("description");
  useEffect(() => {
    const box = descriptionRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${box.scrollHeight}px`;
  }, [descriptionText]);

  // `name#project#label` in the name sets the project and label, so they need
  // no picking. Only when adding a task: not editing, and not a sub-task.
  const rawName = form.watch("taskName") ?? "";
  const quickAdd = !editTask && !parentId && rawName.includes("#");
  const typed = parseQuickAdd(rawName);
  const projectRes = quickAdd
    ? resolveByName(projects, typed.project, projectNames)
    : { status: "empty" as const };
  const labelRes = quickAdd
    ? resolveByName(labels, typed.label, labelNames)
    : { status: "empty" as const };
  const typedProjectId =
    projectRes.status === "match" ? projectRes.item._id : undefined;
  const typedLabelId =
    labelRes.status === "match" ? labelRes.item._id : undefined;
  const projectProblem =
    projectRes.status === "none" || projectRes.status === "ambiguous"
      ? problemWith("project", typed.project, projectRes, (p) => projectName(p))
      : null;
  const labelProblem =
    labelRes.status === "none" || labelRes.status === "ambiguous"
      ? problemWith("label", typed.label, labelRes, (l) => l.name)
      : null;
  const quickProblem = !quickAdd
    ? null
    : typed.tooMany
      ? "Use name#project#label. Only two # are allowed."
      : projectProblem ?? labelProblem;
  // A problem is a quiet hint while typing and an error once Create is pressed.
  const [attempted, setAttempted] = useState(false);

  // The projects/labels queries resolve after the first render, so fill the
  // selects in once the defaults are known.
  useEffect(() => {
    if (!form.getValues("projectId") && projectId) {
      form.setValue("projectId", projectId);
    }
    if (!form.getValues("labelId") && labelId) {
      form.setValue("labelId", labelId);
    }
  }, [form, projectId, labelId]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const { description, priority } = data;
    if (quickAdd) {
      if (quickProblem) {
        setAttempted(true);
        return;
      }
      if (typed.name.length < 2) {
        form.setError("taskName", {
          message: "Task name must be at least 2 characters.",
        });
        return;
      }
    }
    const taskName = quickAdd ? typed.name : data.taskName;
    const projectId = typedProjectId ?? data.projectId;
    const labelId = typedLabelId ?? data.labelId;
    if (!projectId) return;

    const parsed = scheduleToFields(schedule);
    if (!parsed.ok) {
      setScheduleError(parsed.error);
      return;
    }
    setScheduleError(null);
    const { fields } = parsed;

    const common = {
      taskName,
      description,
      priority: parseInt(priority),
      projectId: projectId as Id<"projects">,
      labelId: labelId as Id<"labels">,
    };

    let saved: unknown;
    if (editTask) {
      saved = await updateATodo({ taskId: editTask._id, ...common, ...fields });
    } else if (parentId) {
      // Sub-tasks only keep a day.
      saved = await createASubTodo({
        parentId,
        ...common,
        dueDate: fields.dueDate,
      });
    } else {
      saved = await createATodo({ ...common, ...fields });
    }

    if (saved) {
      toast({
        title: editTask
          ? "Task saved"
          : parentId
            ? "Sub-task added"
            : "Task added",
        duration: 3000,
      });
      if (!editTask) {
        form.reset({ ...defaultValues });
        setSchedule(startSchedule());
        setAttempted(false);
        // Ready for the next one.
        nameRef.current?.focus();
      }
      onDone?.();
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(event) => {
          // Popovers and menus render in portals, but their key events still
          // bubble through React. Only an Escape typed in the form itself
          // closes it; inside a portal it belongs to that popover or menu.
          if (
            event.key === "Escape" &&
            event.currentTarget.contains(event.target as Node)
          ) {
            setShowAddTask(false);
          }
        }}
        className={cn(
          variant === "card" &&
            "my-3 animate-row-in rounded-md border bg-card p-4",
          variant === "plain" && "animate-row-in border-b py-3",
        )}
      >
        <FormField
          control={form.control}
          name="taskName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  id="taskName"
                  type="text"
                  autoFocus
                  aria-label="Task name"
                  placeholder="Task name"
                  required
                  className="h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-1 text-xl font-semibold shadow-none focus-visible:border-foreground focus-visible:outline-none"
                  {...field}
                  ref={(node) => {
                    field.ref(node);
                    nameRef.current = node;
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mt-1">
              <FormControl>
                <Textarea
                  id="description"
                  aria-label="Description"
                  placeholder="Description"
                  rows={1}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      (event.metaKey || event.ctrlKey)
                    ) {
                      event.preventDefault();
                      void form.handleSubmit(onSubmit)();
                    }
                  }}
                  className="min-h-0 resize-none overflow-hidden rounded-none border-0 bg-transparent px-0 py-1 text-[15px] text-muted-foreground shadow-none focus-visible:text-foreground focus-visible:outline-none"
                  {...field}
                  ref={(node) => {
                    field.ref(node);
                    descriptionRef.current = node;
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div
          className={cn(
            "mt-4",
            parentId ? "flex flex-wrap gap-2" : "space-y-2",
          )}
        >
          <div className={cn("flex flex-wrap gap-2", parentId && "contents")}>
            <DateChip
              value={schedule}
              simple={!!parentId}
              onChange={(patch) => {
                setScheduleError(null);
                setSchedule((prev) => applyScheduleChange(prev, patch));
              }}
            />
            {!parentId && (
              <RepeatChip
                value={schedule}
                onChange={(patch) => {
                  setScheduleError(null);
                  setSchedule((prev) => applyScheduleChange(prev, patch));
                }}
              />
            )}
          </div>

          <div className={cn("flex flex-wrap gap-2", parentId && "contents")}>
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        aria-label="Priority"
                        className={cn(chipClass, "w-auto justify-start")}
                      >
                        <SelectValue>
                          <span className="flex items-center gap-2">
                            <PriorityDot
                              level={priorityLevel(parseInt(field.value))}
                            />
                            {priorityLevel(parseInt(field.value)) === 1 ? (
                              <span className="text-muted-foreground">
                                Priority
                              </span>
                            ) : (
                              PRIORITIES[
                                priorityLevel(parseInt(field.value)) - 1
                              ]
                            )}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITIES.map((name, index) => (
                        <SelectItem key={name} value={(index + 1).toString()}>
                          <span className="flex items-center gap-2">
                            <PriorityDot level={index + 1} />
                            {name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {!parentId && (
              <>
                <FormField
                  control={form.control}
                  name="labelId"
                  render={({ field }) => {
                    const labelValue = typedLabelId ?? field.value;
                    const label = labels.find((l) => l._id === labelValue);
                    return (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          disabled={!!typedLabelId}
                          value={labelValue}
                        >
                          <FormControl>
                            <SelectTrigger
                              aria-label="Label"
                              aria-invalid={!!labelProblem}
                              title={
                                typedLabelId ? "Set by the name" : undefined
                              }
                              className={cn(
                                chipClass,
                                "w-auto justify-start disabled:cursor-default",
                                typedLabelId && "disabled:opacity-100",
                              )}
                            >
                              <SelectValue placeholder="Label">
                                <span
                                  className="flex items-center gap-2"
                                  style={swatchStyle(labelColourOf(labelValue))}
                                >
                                  <Tag
                                    aria-hidden
                                    className="h-3.5 w-3.5 text-[color:var(--sw-fg)] dark:text-[color:var(--sw-fg-dark)]"
                                    strokeWidth={1.75}
                                  />
                                  {label?.name ?? "Label"}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {labels.map((label: Doc<"labels">) => (
                              <SelectItem key={label._id} value={label._id}>
                                <LabelTag label={label} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => {
                    const projectValue = typedProjectId ?? field.value;
                    const project = projects.find(
                      (p) => p._id === projectValue,
                    );
                    return (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          disabled={!!typedProjectId}
                          value={projectValue}
                        >
                          <FormControl>
                            <SelectTrigger
                              aria-label="Project"
                              aria-invalid={!!projectProblem}
                              title={
                                typedProjectId ? "Set by the name" : undefined
                              }
                              className={cn(
                                chipClass,
                                "w-auto justify-start disabled:cursor-default",
                                typedProjectId && "disabled:opacity-100",
                              )}
                            >
                              <SelectValue placeholder="Project">
                                <span className="flex items-center gap-2">
                                  <ProjectDot projectId={projectValue} />
                                  {project ? projectName(project) : "Project"}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project: Doc<"projects">) => (
                              <SelectItem key={project._id} value={project._id}>
                                <span className="flex items-center gap-2">
                                  <ProjectDot projectId={project._id} />
                                  {projectName(project)}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    );
                  }}
                />
              </>
            )}
          </div>

          {quickProblem && (
            <p
              role={attempted ? "alert" : undefined}
              className={cn(
                "text-sm",
                attempted
                  ? "font-medium text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {quickProblem}
            </p>
          )}
          {scheduleError && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {scheduleError}
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAddTask(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {editTask ? "Save task" : parentId ? "Add sub-task" : "Add task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
