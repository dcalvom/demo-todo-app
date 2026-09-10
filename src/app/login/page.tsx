"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Id } from "../../../convex/_generated/dataModel";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const loginAction = useAction(api.authActions.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await loginAction({ email, password });
      login(result.token, {
        userId: result.userId as Id<"users">,
        name: result.name,
        email,
        role: result.role as "ceo" | "boss" | "employee",
        departmentId: result.departmentId as Id<"departments"> | undefined,
      });
      if (result.role === "ceo") {
        router.push("/dashboard/ceo");
      } else if (result.role === "boss") {
        router.push("/dashboard/boss");
      } else {
        router.push("/dashboard/employee");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-6">
            Access your organization todos
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            No account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
