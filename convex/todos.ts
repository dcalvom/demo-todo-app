import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const statusValidator = v.union(
  v.literal("pending"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("cancelled")
);

const priorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high")
);

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: priorityValidator,
    assignedToId: v.id("users"),
    assignedById: v.id("users"),
    departmentId: v.id("departments"),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("todos", {
      title: args.title,
      description: args.description,
      status: "pending",
      priority: args.priority,
      assignedToId: args.assignedToId,
      assignedById: args.assignedById,
      departmentId: args.departmentId,
      expiresAt: args.expiresAt,
    });
  },
});

export const update = mutation({
  args: {
    todoId: v.id("todos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(statusValidator),
    priority: v.optional(priorityValidator),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { todoId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.description !== undefined)
      updates.description = fields.description;
    if (fields.status !== undefined) {
      updates.status = fields.status;
      if (fields.status === "completed") {
        updates.completedAt = Date.now();
      }
    }
    if (fields.priority !== undefined) updates.priority = fields.priority;
    if (fields.expiresAt !== undefined) updates.expiresAt = fields.expiresAt;
    await ctx.db.patch(todoId, updates);
  },
});

export const remove = mutation({
  args: { todoId: v.id("todos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.todoId);
  },
});

export const getByAssignedTo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todos")
      .withIndex("by_assigned_to", (q) => q.eq("assignedToId", args.userId))
      .order("desc")
      .take(100);
  },
});

export const getByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todos")
      .withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      )
      .order("desc")
      .take(100);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todos").order("desc").take(500);
  },
});

export const getById = query({
  args: { todoId: v.id("todos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.todoId);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const todos = await ctx.db.query("todos").take(500);
    const now = Date.now();
    return {
      total: todos.length,
      pending: todos.filter((t) => t.status === "pending").length,
      in_progress: todos.filter((t) => t.status === "in_progress").length,
      completed: todos.filter((t) => t.status === "completed").length,
      cancelled: todos.filter((t) => t.status === "cancelled").length,
      overdue: todos.filter(
        (t) => t.expiresAt < now && t.status !== "completed" && t.status !== "cancelled"
      ).length,
    };
  },
});

export const getStatsByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      )
      .take(200);
    const now = Date.now();
    return {
      total: todos.length,
      pending: todos.filter((t) => t.status === "pending").length,
      in_progress: todos.filter((t) => t.status === "in_progress").length,
      completed: todos.filter((t) => t.status === "completed").length,
      cancelled: todos.filter((t) => t.status === "cancelled").length,
      overdue: todos.filter(
        (t) =>
          t.expiresAt < now &&
          t.status !== "completed" &&
          t.status !== "cancelled"
      ).length,
    };
  },
});
