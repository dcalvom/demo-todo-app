import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const getUserIdByEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args): Promise<string | null> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return user ? user._id : null;
  },
});

export const getUserByEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      departmentId: user.departmentId,
      isActive: user.isActive,
    };
  },
});

export const createUser = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(
      v.literal("ceo"),
      v.literal("boss"),
      v.literal("employee")
    ),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args): Promise<string> => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      role: args.role,
      departmentId: args.departmentId,
      isActive: true,
    });
    return userId;
  },
});

export const getMe = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.isActive) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },
});

export const listByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_department", (q) =>
        q.eq("departmentId", args.departmentId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(100);
    return users.map(({ passwordHash: _, ...u }) => u);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(200);
    return users.map(({ passwordHash: _, ...u }) => u);
  },
});

export const updateUserDepartment = mutation({
  args: {
    userId: v.id("users"),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { departmentId: args.departmentId });
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("ceo"),
      v.literal("boss"),
      v.literal("employee")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const deactivateUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isActive: false });
  },
});

export const getById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    return await ctx.db.get(args.userId);
  },
});
