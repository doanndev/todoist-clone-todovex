import { Clock, Repeat } from "lucide-react";
import moment from "moment";

import {
  describeRecurrence,
  formatSpan,
  spanOf,
  type Schedulable,
} from "@/lib/schedule";
import { cn } from "@/lib/utils";

/** When a task is: a day, a range of days, or a time span, plus a repeat mark. */
export default function DueDate({
  task,
  isCompleted,
  className,
}: {
  task: Schedulable;
  isCompleted?: boolean;
  className?: string;
}) {
  const overdue =
    !isCompleted && spanOf(task).end <= moment().startOf("day").valueOf();
  const repeats = task.recurrence
    ? describeRecurrence(task.recurrence, task.dueDate)
    : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-sm tabular-nums",
        overdue ? "font-semibold text-destructive" : "text-muted-foreground",
        className,
      )}
    >
      {overdue && (
        <>
          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Overdue, </span>
        </>
      )}
      {formatSpan(task)}
      {repeats && (
        <>
          <Repeat
            className="h-3.5 w-3.5 shrink-0"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="sr-only">{repeats}</span>
        </>
      )}
    </span>
  );
}
