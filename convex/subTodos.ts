import { Id } from "./_generated/dataModel";
import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { LIST_LIMIT } from "./limits";
import { handleUserId, ownedTask } from "./auth";

export const checkASubTodo = mutation({
  args: { taskId: v.id("subTodos") },
  handler: async (ctx, { taskId }) => {
    if (!(await ownedTask(ctx, taskId))) return null;
    await ctx.db.patch(taskId, { isCompleted: true });
    return taskId;
  },
});

export const unCheckASubTodo = mutation({
  args: { taskId: v.id("subTodos") },
  handler: async (ctx, { taskId }) => {
    if (!(await ownedTask(ctx, taskId))) return null;
    await ctx.db.patch(taskId, { isCompleted: false });
    return taskId;
  },
});

export const createASubTodo = mutation({
  args: {
    taskName: v.string(),
    description: v.optional(v.string()),
    priority: v.number(),
    dueDate: v.number(),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    parentId: v.id("todos"),
  },
  handler: async (ctx, fields) => {
    const userId = await handleUserId(ctx);
    if (!userId) return null;
    return await ctx.db.insert("subTodos", {
      userId,
      ...fields,
      isCompleted: false,
    });
  },
});

async function subTodosOf(ctx: QueryCtx, parentId: Id<"todos">) {
  const userId = await handleUserId(ctx);
  if (!userId) return [];
  const rows = await ctx.db
    .query("subTodos")
    .withIndex("by_parent", (q) => q.eq("parentId", parentId))
    .take(LIST_LIMIT);
  return rows.filter((row) => row.userId === userId);
}

export const completedSubTodos = query({
  args: { parentId: v.id("todos") },
  handler: async (ctx, { parentId }) =>
    (await subTodosOf(ctx, parentId)).filter((row) => row.isCompleted),
});

export const inCompleteSubTodos = query({
  args: { parentId: v.id("todos") },
  handler: async (ctx, { parentId }) =>
    (await subTodosOf(ctx, parentId)).filter((row) => !row.isCompleted),
});

export const deleteASubTodo = mutation({
  args: {
    taskId: v.id("subTodos"),
  },
  handler: async (ctx, { taskId }) => {
    if (!(await ownedTask(ctx, taskId))) return null;
    await ctx.db.delete(taskId);
    return taskId;
  },
});
