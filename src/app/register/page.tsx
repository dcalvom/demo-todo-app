"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Id } from "../../../convex/_generated/dataModel";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const registerAction = useAction(api.authActions.register);
  const departments = useQuery(api.departments.listAll);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ceo" | "boss" | "employee">("employee");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setIsLoading(true);
    try {
      const result = await registerAction({
        name,
        email,
        password,
        role,
        departmentId: departmentId
          ? (departmentId as Id<"departments">)
          : undefined,
      });
      login(result.token, {
        userId: result.userId as Id<"users">,
        name: result.name,
        email,
        role: result.role as "ceo" | "boss" | "employee",
        departmentId: departmentId
          ? (departmentId as Id<"departments">)
          : undefined,
      });
      if (result.role === "ceo") {
        router.push("/dashboard/ceo");
      } else if (result.role === "boss") {
        router.push("/dashboard/boss");
      } else {
        router.push("/dashboard/employee");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Create account
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Join your organization
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="John Doe"
              />
            </div>
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
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "ceo" | "boss" | "employee")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="employee">Employee</option>
                <option value="boss">Boss</option>
                <option value="ceo">CEO</option>
              </select>
            </div>
            {role !== "ceo" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">Select department (optional)</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
