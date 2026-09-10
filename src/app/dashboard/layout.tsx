"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const roleBadge = {
    ceo: "bg-purple-100 text-purple-700",
    boss: "bg-blue-100 text-blue-700",
    employee: "bg-green-100 text-green-700",
  }[user.role];

  const dashboardLink =
    user.role === "ceo"
      ? "/dashboard/ceo"
      : user.role === "boss"
        ? "/dashboard/boss"
        : "/dashboard/employee";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link
                href={dashboardLink}
                className="text-lg font-bold text-gray-900"
              >
                TodoOrg
              </Link>
              <nav className="hidden sm:flex items-center gap-4">
                <Link
                  href={dashboardLink}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                {(user.role === "ceo" || user.role === "boss") && (
                  <Link
                    href="/dashboard/departments"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Departments
                  </Link>
                )}
                {user.role === "ceo" && (
                  <Link
                    href="/dashboard/users"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Users
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full uppercase tracking-wide ${roleBadge}`}
              >
                {user.role}
              </span>
              <span className="text-sm text-gray-700 hidden sm:block">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
