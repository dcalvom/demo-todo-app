"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SALT_ROUNDS = 12;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export const hashPassword = internalAction({
  args: { password: v.string() },
  handler: async (_ctx, args): Promise<string> => {
    return await bcrypt.hash(args.password, SALT_ROUNDS);
  },
});

export const comparePassword = internalAction({
  args: { password: v.string(), hash: v.string() },
  handler: async (_ctx, args): Promise<boolean> => {
    return await bcrypt.compare(args.password, args.hash);
  },
});

export const generateToken = internalAction({
  args: {
    userId: v.string(),
    email: v.string(),
    role: v.string(),
    name: v.string(),
  },
  handler: async (_ctx, args): Promise<string> => {
    const secret = getJwtSecret();
    return await new SignJWT({
      sub: args.userId,
      email: args.email,
      role: args.role,
      name: args.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setAudience("demo-todo-app")
      .setIssuer("demo-todo-app")
      .sign(secret);
  },
});

export const verifyToken = internalAction({
  args: { token: v.string() },
  handler: async (
    _ctx,
    args
  ): Promise<{
    userId: string;
    email: string;
    role: string;
    name: string;
  } | null> => {
    try {
      const secret = getJwtSecret();
      const { payload } = await jwtVerify(args.token, secret, {
        audience: "demo-todo-app",
        issuer: "demo-todo-app",
      });
      return {
        userId: payload.sub as string,
        email: payload.email as string,
        role: payload.role as string,
        name: payload.name as string,
      };
    } catch {
      return null;
    }
  },
});

export const register = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("ceo"),
      v.literal("boss"),
      v.literal("employee")
    ),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    const existing: string | null = await ctx.runMutation(
      internal.users.getUserIdByEmail,
      { email: args.email }
    );
    if (existing) {
      throw new Error("Email already registered");
    }

    const passwordHash: string = await ctx.runAction(
      internal.authActions.hashPassword,
      { password: args.password }
    );

    const userId: string = await ctx.runMutation(internal.users.createUser, {
      name: args.name,
      email: args.email,
      passwordHash,
      role: args.role,
      departmentId: args.departmentId,
    });

    const token: string = await ctx.runAction(
      internal.authActions.generateToken,
      {
        userId,
        email: args.email,
        role: args.role,
        name: args.name,
      }
    );

    return { token, userId, role: args.role, name: args.name };
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    token: string;
    userId: string;
    role: string;
    name: string;
    departmentId?: string;
  }> => {
    const user: {
      _id: string;
      name: string;
      email: string;
      passwordHash: string;
      role: string;
      departmentId?: string;
      isActive: boolean;
    } | null = await ctx.runMutation(internal.users.getUserByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    const isValid: boolean = await ctx.runAction(
      internal.authActions.comparePassword,
      {
        password: args.password,
        hash: user.passwordHash,
      }
    );

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const token: string = await ctx.runAction(
      internal.authActions.generateToken,
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      }
    );

    return {
      token,
      userId: user._id,
      role: user.role,
      name: user.name,
      departmentId: user.departmentId,
    };
  },
});
