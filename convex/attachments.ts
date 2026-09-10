import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    todoId: v.id("todos"),
    uploadedById: v.id("users"),
    fileName: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("attachments", {
      todoId: args.todoId,
      uploadedById: args.uploadedById,
      fileName: args.fileName,
      fileUrl: args.fileUrl,
      fileSize: args.fileSize,
      contentType: args.contentType,
    });
  },
});

export const getByTodo = query({
  args: { todoId: v.id("todos") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attachments")
      .withIndex("by_todo", (q) => q.eq("todoId", args.todoId))
      .take(20);
  },
});

export const remove = mutation({
  args: { attachmentId: v.id("attachments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.attachmentId);
  },
});
