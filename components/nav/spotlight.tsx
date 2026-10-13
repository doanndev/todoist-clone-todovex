"use client";
import { useMutation, useQuery } from "convex/react";
import { Plus, Search } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { KeyboardEvent, ReactNode, useId, useRef, useState } from "react";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  completeSegment,
  currentSegmentText,
  parseQuickAdd,
  resolveByName,
  suggest,
  type Resolution,
} from "@/lib/quick-add";
import { labelNames, problemWith, projectNames } from "@/lib/quick-resolve";
import { projectName } from "@/lib/swatch";
import { cn } from "@/lib/utils";
import LabelTag from "../todos/label-tag";
import ProjectChip from "../todos/project-chip";
import { useToast } from "../ui/use-toast";

type Row = {
  id: string;
  content: ReactNode;
  onSelect: () => void;
};

/** What the Project or Label row of the preview shows for what was typed. */
function Resolved<T>({
  res,
  typed,
  kind,
  show,
  fallback,
}: {
  res: Resolution<T>;
  typed: string | null;
  kind: string;
  show: (item: T) => ReactNode;
  fallback: string;
}) {
  switch (res.status) {
    case "match":
      return <>{show(res.item)}</>;
    case "none":
      return (
        <span className="text-destructive">
          No {kind} named &ldquo;{typed}&rdquo;
        </span>
      );
    case "ambiguous":
      return <span className="text-muted-foreground">Several match</span>;
    default:
      return (
        <span className="text-muted-foreground">{fallback} (default)</span>
      );
  }
}

export default function Spotlight() {
  const router = useRouter();
  const { toast } = useToast();
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const projects = useQuery(api.projects.getProjects);
  const labels = useQuery(api.labels.getLabels);
  const createATodo = useMutation(api.todos.createATodo);

  const adding = value.startsWith("+");
  const body = adding ? value.slice(1) : "";
  const query = adding ? "" : value.trim();

  const results = useQuery(api.search.searchTasks, query ? { query } : "skip");

  const parsed = parseQuickAdd(body);
  const projectRes = resolveByName(
    projects ?? [],
    parsed.project,
    projectNames,
  );
  const labelRes = resolveByName(labels ?? [], parsed.label, labelNames);
  const defaultProject =
    projects?.find((p) => p.type === "system") ?? projects?.[0];
  const defaultLabel = labels?.[0];

  const update = (next: string) => {
    setValue(next);
    setOpen(true);
    setActive(-1);
    setError(null);
  };

  const rows: Row[] = [];
  if (adding && parsed.segment >= 1) {
    const typed = currentSegmentText(body);
    if (parsed.segment === 1) {
      for (const p of suggest(projects ?? [], typed, projectNames)) {
        rows.push({
          id: p._id,
          content: <ProjectChip project={p} />,
          onSelect: () => complete(projectName(p)),
        });
      }
    } else {
      for (const l of suggest(labels ?? [], typed, labelNames)) {
        rows.push({
          id: l._id,
          content: <LabelTag label={l} />,
          onSelect: () => complete(l.name),
        });
      }
    }
  } else if (!adding && query) {
    for (const task of (results ?? [])
      .filter((t) => !t.isCompleted)
      .slice(0, 5)) {
      rows.push({
        id: task._id,
        content: (
          <>
            <span className="min-w-0 flex-1 truncate">{task.taskName}</span>
            <ProjectChip
              project={projects?.find((p) => p._id === task.projectId)}
            />
          </>
        ),
        onSelect: () => go(`/loggedin/projects/${task.projectId}`),
      });
    }
    rows.push({
      id: "all",
      content: (
        <span className="text-muted-foreground">
          Search all tasks for &ldquo;{query}&rdquo;
        </span>
      ),
      onSelect: () => go(`/loggedin/search/${encodeURIComponent(query)}`),
    });
  }

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function complete(name: string) {
    update(`+${completeSegment(body, name)}`);
    inputRef.current?.focus();
  }

  async function submit() {
    if (!parsed.name) {
      setError("Type a task name after +.");
      return;
    }
    if (parsed.tooMany) {
      setError("Use name#project#label. Only two # are allowed.");
      return;
    }
    if (!projects || !labels) {
      setError("Still loading projects and labels. Try again.");
      return;
    }

    const projectProblem = problemWith(
      "project",
      parsed.project,
      projectRes,
      (p) => projectName(p),
    );
    const labelProblem = problemWith(
      "label",
      parsed.label,
      labelRes,
      (l) => l.name,
    );
    if (projectProblem || labelProblem) {
      setError(projectProblem ?? labelProblem);
      return;
    }

    const project =
      projectRes.status === "match" ? projectRes.item : defaultProject;
    const label = labelRes.status === "match" ? labelRes.item : defaultLabel;
    if (!project || !label) {
      setError("Create a label first, then try again.");
      return;
    }

    const id = await createATodo({
      taskName: parsed.name,
      priority: 1,
      dueDate: moment().valueOf(),
      projectId: project._id,
      labelId: label._id,
    });

    if (!id) {
      setError("The task could not be added. Try again.");
      return;
    }

    toast({
      title: "Task added",
      description: `${parsed.name} in ${projectName(project)}`,
      duration: 3000,
    });
    // Stay in add mode so several tasks can be entered back to back.
    update("+");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (rows.length === 0) return;
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      // Cycles through the rows, with one extra stop for "nothing highlighted".
      setActive(
        (current) =>
          ((current + 1 + step + rows.length + 1) % (rows.length + 1)) - 1,
      );
      return;
    }
    if (
      event.key === "Tab" &&
      adding &&
      rows.length > 0 &&
      parsed.segment >= 1
    ) {
      event.preventDefault();
      rows[active >= 0 ? active : 0].onSelect();
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && rows[active]) {
        rows[active].onSelect();
      } else if (adding) {
        void submit();
      } else if (query) {
        go(`/loggedin/search/${encodeURIComponent(query)}`);
      }
    }
  }

  const showPanel = open && (adding || query !== "" || value === "");
  const Icon = adding ? Plus : Search;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <label htmlFor="spotlight" className="sr-only">
        Search tasks, or type + to add one
      </label>
      <Icon
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        strokeWidth={1.75}
      />
      <input
        id="spotlight"
        ref={inputRef}
        value={value}
        onChange={(event) => update(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder="Search tasks, or type + to add one"
        className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-[15px] placeholder:text-muted-foreground transition-colors focus-visible:border-foreground"
      />

      {showPanel && (
        <div
          onMouseDown={(event) => event.preventDefault()}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
        >
          {adding && (
            <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-y-2 border-b px-4 py-3 text-[15px]">
              <dt className="text-muted-foreground">Task</dt>
              <dd className="truncate font-semibold">
                {parsed.name || (
                  <span className="font-normal text-muted-foreground">
                    Type a name
                  </span>
                )}
              </dd>
              <dt className="text-muted-foreground">Project</dt>
              <dd>
                <Resolved
                  res={projectRes}
                  typed={parsed.project}
                  kind="project"
                  show={(project) => <ProjectChip project={project} />}
                  fallback={
                    defaultProject ? projectName(defaultProject) : "Unfiled"
                  }
                />
              </dd>
              <dt className="text-muted-foreground">Label</dt>
              <dd>
                <Resolved
                  res={labelRes}
                  typed={parsed.label}
                  kind="label"
                  show={(label) => <LabelTag label={label} />}
                  fallback={defaultLabel?.name ?? "None"}
                />
              </dd>
            </dl>
          )}

          {rows.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="max-h-72 overflow-y-auto p-1"
            >
              {rows.map((row, index) => (
                <li
                  key={row.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onClick={row.onSelect}
                  onMouseMove={() => setActive(index)}
                  className={cn(
                    "flex h-11 cursor-pointer items-center gap-3 rounded-sm px-3 text-[15px]",
                    index === active && "bg-accent",
                  )}
                >
                  {row.content}
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p
              role="alert"
              className="border-t px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {!adding && query === "" && (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Type to search. Start with <Kbd>+</Kbd> to add a task, for example{" "}
              <span className="text-foreground">+Buy milk#Garden#Personal</span>
              .
            </p>
          )}

          {adding && (
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2.5 text-xs text-muted-foreground">
              <span>
                <Kbd>Enter</Kbd> add
              </span>
              <span>
                <Kbd>Tab</Kbd> complete
              </span>
              <span>
                <Kbd>Esc</Kbd> close
              </span>
              <span className="ml-auto">name#project#label</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-[4px] border bg-secondary px-1.5 py-0.5 text-xs font-medium text-foreground">
      {children}
    </kbd>
  );
}
