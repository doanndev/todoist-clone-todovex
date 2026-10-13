import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { handleUserId } from "./auth";
import { colorValidator } from "./colors";
import { LIST_LIMIT } from "./limits";

export const getLabels = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) return [];

    const userLabels = await ctx.db
      .query("labels")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(LIST_LIMIT);

    const systemLabels = await ctx.db
      .query("labels")
      .withIndex("by_type_and_name", (q) => q.eq("type", "system"))
      .take(LIST_LIMIT);

    // The index orders system labels by name; the list keeps creation order.
    systemLabels.sort((a, b) => a._creationTime - b._creationTime);
    return [...systemLabels, ...userLabels];
  },
});

export const getLabelByLabelId = query({
  args: {
    labelId: v.id("labels"),
  },
  handler: async (ctx, { labelId }) => {
    const userId = await handleUserId(ctx);
    if (!userId) return null;
    const label = await ctx.db.get(labelId);
    // The shared default labels, or one of the user's own.
    if (label && (label.type === "system" || label.userId === userId)) {
      return label;
    }
    return null;
  },
});

export const createALabel = mutation({
  args: {
    name: v.string(),
    color: v.optional(colorValidator),
  },
  handler: async (ctx, { name, color }) => {
    const userId = await handleUserId(ctx);
    if (!userId) return null;
    return await ctx.db.insert("labels", {
      userId,
      name,
      color,
      type: "user",
    });
  },
});

export const updateLabelColor = mutation({
  args: {
    labelId: v.id("labels"),
    color: colorValidator,
  },
  handler: async (ctx, { labelId, color }) => {
    const userId = await handleUserId(ctx);
    const label = await ctx.db.get(labelId);
    if (!userId || !label) return null;
    // The user's own labels, or the shared defaults (this is a local app).
    if (label.type === "user" && label.userId !== userId) return null;
    await ctx.db.patch(labelId, { color });
    return labelId;
  },
});
