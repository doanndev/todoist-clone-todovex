import { internalMutation } from "./_generated/server";
import { LOCAL_USER_EMAIL } from "./auth";

const SYSTEM_PROJECTS = ["Inbox"];
const SYSTEM_LABELS = ["Personal", "Work", "Shopping"];

// Idempotent: safe to run on every `npm run dev`. Creates the local user and
// the system project/labels the UI relies on, only if they are missing.
export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", LOCAL_USER_EMAIL))
      .unique();

    if (!existingUser) {
      await ctx.db.insert("users", {
        email: LOCAL_USER_EMAIL,
        name: "Local user",
      });
    }

    for (const name of SYSTEM_PROJECTS) {
      const found = await ctx.db
        .query("projects")
        .withIndex("by_type_and_name", (q) =>
          q.eq("type", "system").eq("name", name),
        )
        .first();
      if (!found) {
        await ctx.db.insert("projects", { userId: null, name, type: "system" });
      }
    }

    for (const name of SYSTEM_LABELS) {
      const found = await ctx.db
        .query("labels")
        .withIndex("by_type_and_name", (q) =>
          q.eq("type", "system").eq("name", name),
        )
        .first();
      if (!found) {
        await ctx.db.insert("labels", { userId: null, name, type: "system" });
      }
    }
  },
});
