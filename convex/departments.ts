import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    bossId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("departments")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (existing) throw new Error("Department name already exists");

    return await ctx.db.insert("departments", {
      name: args.name,
      description: args.description,
      bossId: args.bossId,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    departmentId: v.id("departments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    bossId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { departmentId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.description !== undefined)
      updates.description = fields.description;
    if (fields.bossId !== undefined) updates.bossId = fields.bossId;
    await ctx.db.patch(departmentId, updates);
  },
});

export const deactivate = mutation({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.departmentId, { isActive: false });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(100);
  },
});

export const getById = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.departmentId);
  },
});

export const getByBoss = query({
  args: { bossId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("departments")
      .withIndex("by_boss", (q) => q.eq("bossId", args.bossId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(20);
  },
});
