import { Doc, Id } from "./_generated/dataModel";
import { DatabaseReader } from "./_generated/server";

// Offline/local mode: there is no login. Every request acts as one fixed
// local user, which `seed:init` creates.
export const LOCAL_USER_EMAIL = "dev@local";

export async function handleUserId(ctx: { db: DatabaseReader }) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", LOCAL_USER_EMAIL))
    .unique();

  return user?._id ?? null;
}

/** The task (or sub-task) when it belongs to the local user, otherwise null. */
export async function ownedTask<T extends "todos" | "subTodos">(
  ctx: { db: DatabaseReader },
  id: Id<T>,
): Promise<Doc<T> | null> {
  const userId = await handleUserId(ctx);
  const task = await ctx.db.get(id);
  if (!userId || !task || task.userId !== userId) return null;
  return task;
}
