import { v } from "convex/values";
import { query } from "./_generated/server";
import { handleUserId } from "./auth";
import { LIST_LIMIT } from "./limits";

// Plain case-insensitive substring match over task name and description.
export const searchTasks = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query }) => {
    const userId = await handleUserId(ctx);
    const needle = query.trim().toLowerCase();
    if (!userId || !needle) return [];

    const todos = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(LIST_LIMIT);

    return todos.filter(
      (todo) =>
        todo.taskName.toLowerCase().includes(needle) ||
        (todo.description ?? "").toLowerCase().includes(needle),
    );
  },
});
