"use client";
import { CalendarIcon, Repeat } from "lucide-react";
import moment from "moment";
import { useId, useState } from "react";

import { describeRecurrence, formatSpan } from "@/lib/schedule";
import {
  scheduleToFields,
  type Ends,
  type Repeat as RepeatKind,
  type ScheduleValue,
} from "@/lib/schedule-form";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Chip } from "../ui/chip";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Change = (patch: Partial<ScheduleValue>) => void;

// Monday first, with the day numbers moment/Date use (0 = Sunday).
const WEEKDAYS: Array<[label: string, name: string, day: number]> = [
  ["Mo", "Monday", 1],
  ["Tu", "Tuesday", 2],
  ["We", "Wednesday", 3],
  ["Th", "Thursday", 4],
  ["Fr", "Friday", 5],
  ["Sa", "Saturday", 6],
  ["Su", "Sunday", 0],
];

const UNIT: Record<Exclude<RepeatKind, "none">, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

const DAY_FORMAT = "YYYY-MM-DD";
const sameDay = (a: Date, b: Date) => moment(a).isSame(b, "day");

const smallButton =
  "inline-flex h-8 items-center rounded-md border border-input bg-card px-2.5 text-[13px] font-semibold transition-colors hover:bg-accent active:scale-[0.98] aria-pressed:border-foreground";

const contentClass =
  "max-h-[var(--radix-popover-content-available-height)] overflow-y-auto p-3";

function DateInput({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: Date;
  min?: Date;
  onChange: (date: Date) => void;
}) {
  return (
    <Input
      type="date"
      aria-label={label}
      value={moment(value).format(DAY_FORMAT)}
      min={min ? moment(min).format(DAY_FORMAT) : undefined}
      onChange={(event) => {
        const next = moment(event.target.value, DAY_FORMAT, true);
        if (next.isValid()) onChange(next.toDate());
      }}
      className="h-9 w-[10.5rem] tabular-nums"
    />
  );
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
}) {
  return (
    <Input
      type="time"
      step={900}
      aria-label={label}
      value={value}
      onChange={(event) => event.target.value && onChange(event.target.value)}
      className="h-9 w-[7rem] tabular-nums"
    />
  );
}

/**
 * The "when" chip. Its popover holds a calendar with quick picks first, and
 * time and end date behind plain toggles, so the common case is one click.
 * `simple` (sub-tasks) keeps only the day.
 */
export function DateChip({
  value,
  onChange,
  simple = false,
}: {
  value: ScheduleValue;
  onChange: Change;
  simple?: boolean;
}) {
  const timeId = useId();
  const [open, setOpen] = useState(false);
  const parsed = scheduleToFields(value);
  const label = parsed.ok
    ? formatSpan({
        ...parsed.fields,
        recurrence: undefined,
        isCompleted: false,
      })
    : "Pick a date";
  const multiDay = !sameDay(value.startDate, value.endDate);

  // A plain all-day pick is finished, so close. With a time or an end date the
  // person is still setting details, so stay open.
  const pickDay = (day: Date) => {
    onChange({ startDate: day });
    if (value.allDay && !multiDay) setOpen(false);
  };

  const today = moment().startOf("day");
  const presets: Array<[string, Date]> = [
    ["Today", today.toDate()],
    ["Tomorrow", today.clone().add(1, "day").toDate()],
    ["Next week", today.clone().add(1, "week").startOf("isoWeek").toDate()],
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Chip aria-label={`Date: ${label}`} aria-invalid={!parsed.ok}>
          <CalendarIcon className="h-4 w-4 opacity-70" strokeWidth={1.75} />
          <span className="tabular-nums">{label}</span>
        </Chip>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={12}
        className={cn("w-[19.5rem] space-y-3", contentClass)}
      >
        <div className="flex gap-1.5">
          {presets.map(([name, day]) => (
            <button
              key={name}
              type="button"
              aria-pressed={sameDay(value.startDate, day)}
              onClick={() => pickDay(day)}
              className={smallButton}
            >
              {name}
            </button>
          ))}
        </div>

        <Calendar
          mode="single"
          selected={value.startDate}
          defaultMonth={value.startDate}
          onSelect={(day) => day && pickDay(day)}
          className="p-0"
        />

        {!simple && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={timeId}
                checked={!value.allDay}
                onCheckedChange={(checked) =>
                  onChange({ allDay: checked !== true })
                }
              />
              <label htmlFor={timeId} className="text-[15px] font-medium">
                Set a time
              </label>
            </div>

            {!value.allDay && (
              <div className="flex items-center gap-2">
                <TimeInput
                  label="Start time"
                  value={value.startTime}
                  onChange={(startTime) => onChange({ startTime })}
                />
                <span aria-hidden className="text-muted-foreground">
                  to
                </span>
                <TimeInput
                  label="End time"
                  value={value.endTime}
                  onChange={(endTime) => onChange({ endTime })}
                />
              </div>
            )}

            {multiDay ? (
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-muted-foreground">Ends</span>
                <DateInput
                  label="End date"
                  value={value.endDate}
                  min={value.startDate}
                  onChange={(endDate) => onChange({ endDate })}
                />
                <button
                  type="button"
                  onClick={() => onChange({ endDate: value.startDate })}
                  className="text-sm font-semibold underline underline-offset-4"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    endDate: moment(value.startDate).add(1, "day").toDate(),
                  })
                }
                className="text-sm font-semibold underline underline-offset-4"
              >
                Add an end date
              </button>
            )}

            {!parsed.ok && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {parsed.error}
                {!value.allDay &&
                  !multiDay &&
                  " To run past midnight, add an end date."}
              </p>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** The "repeat" chip, with its rule in a popover. */
export function RepeatChip({
  value,
  onChange,
}: {
  value: ScheduleValue;
  onChange: Change;
}) {
  const parsed = scheduleToFields(value);
  const rule = parsed.ok ? parsed.fields.recurrence : undefined;
  const label =
    rule && parsed.ok
      ? describeRecurrence(rule, parsed.fields.dueDate)
      : "Repeat";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Chip aria-label={`Repeat: ${rule ? label : "does not repeat"}`}>
          <Repeat className="h-4 w-4 opacity-70" strokeWidth={1.75} />
          <span className={cn(!rule && "text-muted-foreground")}>{label}</span>
        </Chip>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={12}
        className={cn("w-[21rem] space-y-3", contentClass)}
      >
        <Select
          value={value.repeat}
          onValueChange={(repeat) => onChange({ repeat: repeat as RepeatKind })}
        >
          <SelectTrigger aria-label="Repeat">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Does not repeat</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        {value.repeat !== "none" && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-muted-foreground">Every</span>
              <Input
                type="number"
                min={1}
                max={999}
                aria-label="Repeat every"
                value={value.interval}
                onChange={(event) =>
                  onChange({ interval: Number(event.target.value) })
                }
                className="h-9 w-[4.5rem] tabular-nums"
              />
              <span className="text-[15px] text-muted-foreground">
                {UNIT[value.repeat]}
                {value.interval === 1 ? "" : "s"}
              </span>
            </div>

            {value.repeat === "weekly" && (
              <div className="space-y-1.5">
                <div
                  role="group"
                  aria-label="Repeat on"
                  className="flex flex-wrap gap-1.5"
                >
                  {WEEKDAYS.map(([short, name, day]) => {
                    const on = value.weekdays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={on}
                        aria-label={name}
                        onClick={() =>
                          onChange({
                            weekdays: on
                              ? value.weekdays.filter((d) => d !== day)
                              : [...value.weekdays, day],
                          })
                        }
                        className={cn(
                          "h-9 w-9 rounded-md border text-sm font-semibold transition-colors active:scale-95",
                          on
                            ? "border-foreground bg-foreground text-background"
                            : "border-input bg-card hover:bg-accent",
                        )}
                      >
                        {short}
                      </button>
                    );
                  })}
                </div>
                {value.weekdays.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No day picked: repeats on{" "}
                    {moment(value.startDate).format("dddd")}.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] text-muted-foreground">Ends</span>
              <Select
                value={value.ends}
                onValueChange={(ends) => onChange({ ends: ends as Ends })}
              >
                <SelectTrigger aria-label="Ends" className="h-9 w-[8.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="until">On a date</SelectItem>
                  <SelectItem value="count">After</SelectItem>
                </SelectContent>
              </Select>
              {value.ends === "until" && (
                <DateInput
                  label="Repeat until"
                  value={value.until}
                  min={value.startDate}
                  onChange={(until) => onChange({ until })}
                />
              )}
              {value.ends === "count" && (
                <>
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    aria-label="Number of times"
                    value={value.count}
                    onChange={(event) =>
                      onChange({ count: Number(event.target.value) })
                    }
                    className="h-9 w-[4.5rem] tabular-nums"
                  />
                  <span className="text-[15px] text-muted-foreground">
                    times
                  </span>
                </>
              )}
            </div>

            {!parsed.ok && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {parsed.error}
              </p>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
