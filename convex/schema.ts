import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("ceo"), v.literal("boss"), v.literal("employee")),
    departmentId: v.optional(v.id("departments")),
    isActive: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_department", ["departmentId"])
    .index("by_role", ["role"]),

  departments: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    bossId: v.optional(v.id("users")),
    isActive: v.boolean(),
  })
    .index("by_boss", ["bossId"])
    .index("by_name", ["name"]),

  todos: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    assignedToId: v.id("users"),
    assignedById: v.id("users"),
    departmentId: v.id("departments"),
    expiresAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_assigned_to", ["assignedToId"])
    .index("by_department", ["departmentId"])
    .index("by_status", ["status"])
    .index("by_assigned_by", ["assignedById"])
    .index("by_expires_at", ["expiresAt"]),

  attachments: defineTable({
    todoId: v.id("todos"),
    uploadedById: v.id("users"),
    fileName: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    contentType: v.string(),
  })
    .index("by_todo", ["todoId"])
    .index("by_uploaded_by", ["uploadedById"]),
});
