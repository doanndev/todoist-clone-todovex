import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { colorValidator } from "./colors";
import { recurrenceValidator } from "./recurrence";

export const userSchema = {
  email: v.string(),
  name: v.optional(v.string()),
  emailVerified: v.optional(v.number()),
  image: v.optional(v.string()),
};

export default defineSchema({
  users: defineTable(userSchema).index("by_email", ["email"]),
  todos: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    taskName: v.string(),
    description: v.optional(v.string()),
    // The start of the task's time span. Older tasks only have this, as one
    // all-day date. See lib/schedule.ts for how the fields below combine.
    dueDate: v.number(),
    endDate: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    recurrence: v.optional(recurrenceValidator),
    // Start-of-day timestamps of repeats that were ticked off.
    completedOccurrences: v.optional(v.array(v.number())),
    priority: v.optional(v.float64()),
    isCompleted: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_project", ["userId", "projectId"]),
  subTodos: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    parentId: v.id("todos"),
    taskName: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.optional(v.float64()),
    isCompleted: v.boolean(),
  }).index("by_parent", ["parentId"]),
  labels: defineTable({
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    color: v.optional(colorValidator),
    type: v.union(v.literal("user"), v.literal("system")),
  })
    .index("by_user", ["userId"])
    .index("by_type_and_name", ["type", "name"]),
  projects: defineTable({
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    color: v.optional(colorValidator),
    type: v.union(v.literal("user"), v.literal("system")),
  })
    .index("by_user", ["userId"])
    .index("by_type_and_name", ["type", "name"]),
});
