import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { handleUserId } from "./auth";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { colorValidator } from "./colors";
import { LIST_LIMIT } from "./limits";

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await handleUserId(ctx);
    if (!userId) return [];

    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(LIST_LIMIT);

    const systemProjects = await ctx.db
      .query("projects")
      .withIndex("by_type_and_name", (q) => q.eq("type", "system"))
      .take(LIST_LIMIT);

    systemProjects.sort((a, b) => a._creationTime - b._creationTime);
    return [...systemProjects, ...userProjects];
  },
});

export const getProjectByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await handleUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(projectId);
    // The shared system project, or one of the user's own.
    if (project && (project.type === "system" || project.userId === userId)) {
      return project;
    }
    return null;
  },
});

export const createAProject = mutation({
  args: {
    name: v.string(),
    color: v.optional(colorValidator),
  },
  handler: async (ctx, { name, color }) => {
    const userId = await handleUserId(ctx);
    if (!userId) return null;
    return await ctx.db.insert("projects", {
      userId,
      name,
      color,
      type: "user",
    });
  },
});

export const updateProjectColor = mutation({
  args: {
    projectId: v.id("projects"),
    color: colorValidator,
  },
  handler: async (ctx, { projectId, color }) => {
    const userId = await handleUserId(ctx);
    const project = await ctx.db.get(projectId);
    // Only the user's own projects; the system project stays grey.
    if (!userId || !project || project.type === "system") return null;
    if (project.userId !== userId) return null;
    await ctx.db.patch(projectId, { color });
    return projectId;
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await handleUserId(ctx);
    const project = await ctx.db.get(projectId);
    // The system project cannot be deleted, here or in the UI.
    if (!userId || !project || project.type === "system") return null;
    if (project.userId !== userId) return null;
    await ctx.db.delete(projectId);
    return projectId;
  },
});

/** Deletes a project and its tasks. Returns the project id, or null if refused. */
export const deleteProjectAndItsTasks = action({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }): Promise<typeof projectId | null> => {
    const project = await ctx.runQuery(api.projects.getProjectByProjectId, {
      projectId,
    });
    if (!project || project.type === "system") return null;

    const allTasks = await ctx.runQuery(api.todos.getTodosByProjectId, {
      projectId,
    });
    await Promise.allSettled(
      allTasks.map((task: Doc<"todos">) =>
        ctx.runMutation(api.todos.deleteATodo, { taskId: task._id }),
      ),
    );
    return await ctx.runMutation(api.projects.deleteProject, { projectId });
  },
});
