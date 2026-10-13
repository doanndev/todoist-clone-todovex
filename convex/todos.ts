import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { LIST_LIMIT } from "./limits";
import { recurrenceValidator, sameRecurrence } from "./recurrence";
import { handleUserId, ownedTask } from "./auth";

// Keep this many ticked repeats per task, newest first, so a daily habit can
// never grow its document without bound.
const MAX_TICKS = 1000;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(LIST_LIMIT);
  },
});

export const getTodosByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await handleUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("todos")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userId", userId).eq("projectId", projectId),
      )
      .take(LIST_LIMIT);
  },
});

export const checkATodo = mutation({
  args: { taskId: v.id("todos") },
  handler: async (ctx, { taskId }) => {
    if (!(await ownedTask(ctx, taskId))) return null;
    await ctx.db.patch(taskId, { isCompleted: true });
    return taskId;
  },
});

export const unCheckATodo = mutation({
  args: { taskId: v.id("todos") },
  handler: async (ctx, { taskId }) => {
    if (!(await ownedTask(ctx, taskId))) return null;
    await ctx.db.patch(taskId, { isCompleted: false });
    return taskId;
  },
});

export const createATodo = mutation({
  args: {
    taskName: v.string(),
    description: v.optional(v.string()),
    priority: v.number(),
    dueDate: v.number(),
    endDate: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    recurrence: v.optional(recurrenceValidator),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
  },
  handler: async (ctx, fields) => {
    const userId = await handleUserId(ctx);
    if (!userId) return null;
    return await ctx.db.insert("todos", {
      userId,
      ...fields,
      isCompleted: false,
    });
  },
});

export const deleteATodo = mutation({
  args: {
    taskId: v.id("todos"),
  },
  handler: async (ctx, { taskId }) => {
    if (!(await ownedTask(ctx, taskId))) return null;
    await ctx.db.delete(taskId);
    return taskId;
  },
});

export const updateATodo = mutation({
  args: {
    taskId: v.id("todos"),
    taskName: v.string(),
    description: v.optional(v.string()),
    priority: v.number(),
    dueDate: v.number(),
    endDate: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    recurrence: v.optional(recurrenceValidator),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
  },
  handler: async (ctx, { taskId, ...fields }) => {
    const task = await ownedTask(ctx, taskId);
    if (!task) return null;
    // Ticks belong to the old dates, so moving or re-ruling the task clears them.
    const scheduleChanged =
      fields.dueDate !== task.dueDate ||
      fields.endDate !== task.endDate ||
      (fields.allDay ?? true) !== (task.allDay ?? true) ||
      !sameRecurrence(fields.recurrence, task.recurrence);
    // Fields left undefined are removed, so "does not repeat" clears the rule.
    await ctx.db.patch(taskId, {
      ...fields,
      ...(scheduleChanged ? { completedOccurrences: undefined } : {}),
    });
    return taskId;
  },
});

// Ticks one repeat of a recurring task. `key` is the start of that repeat's day.
export const setOccurrenceDone = mutation({
  args: { taskId: v.id("todos"), key: v.number(), done: v.boolean() },
  handler: async (ctx, { taskId, key, done }) => {
    const task = await ownedTask(ctx, taskId);
    if (!task) return null;
    const others = (task.completedOccurrences ?? []).filter((k) => k !== key);
    const ticks = done ? [...others, key] : others;
    await ctx.db.patch(taskId, {
      completedOccurrences: ticks.sort((a, b) => a - b).slice(-MAX_TICKS),
    });
    return taskId;
  },
});
