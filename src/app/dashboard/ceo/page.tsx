"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import StatsCard from "@/components/StatsCard";
import TodoCard from "@/components/TodoCard";
import TodoForm from "@/components/TodoForm";
import AttachFileModal from "@/components/AttachFileModal";
import { Id } from "../../../../convex/_generated/dataModel";

export default function CeoDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [attachingTodoId, setAttachingTodoId] = useState<Id<"todos"> | null>(
    null
  );

  const stats = useQuery(api.todos.getStats);
  const todos = useQuery(api.todos.listAll);
  const departments = useQuery(api.departments.listAll);
  const users = useQuery(api.users.listAll);

  useEffect(() => {
    if (user && user.role !== "ceo") {
      router.replace(
        user.role === "boss" ? "/dashboard/boss" : "/dashboard/employee"
      );
    }
  }, [user, router]);

  if (!user || user.role !== "ceo") return null;

  const recentTodos = todos?.slice(0, 20) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CEO Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Organization overview
          </p>
        </div>
        <button
          onClick={() => setShowTodoForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          New todo
        </button>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatsCard label="Total" value={stats?.total ?? 0} color="blue" />
          <StatsCard label="Pending" value={stats?.pending ?? 0} color="yellow" />
          <StatsCard label="In Progress" value={stats?.in_progress ?? 0} color="blue" />
          <StatsCard label="Completed" value={stats?.completed ?? 0} color="green" />
          <StatsCard label="Cancelled" value={stats?.cancelled ?? 0} color="gray" />
          <StatsCard label="Overdue" value={stats?.overdue ?? 0} color="red" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Departments ({departments?.length ?? 0})
        </h2>
        {!departments || departments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No departments yet.{" "}
            <a
              href="/dashboard/departments"
              className="text-blue-600 hover:underline"
            >
              Create one
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((dept) => {
              const boss = users?.find((u) => u._id === dept.bossId);
              const memberCount = users?.filter(
                (u) => u.departmentId === dept._id
              ).length ?? 0;
              return (
                <div
                  key={dept._id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <h3 className="font-medium text-gray-900">{dept.name}</h3>
                  {dept.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {dept.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>{memberCount} members</span>
                    {boss && <span>Boss: {boss.name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recent todos
        </h2>
        {recentTodos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No todos yet.
          </div>
        ) : (
          <div className="space-y-2">
            {recentTodos.map((todo) => (
              <TodoCard
                key={todo._id}
                todo={todo}
                currentUserId={user.userId}
                canEdit
                onAttachFile={(id) => setAttachingTodoId(id)}
              />
            ))}
          </div>
        )}
      </section>

      {showTodoForm && (
        <TodoForm
          currentUserId={user.userId}
          onClose={() => setShowTodoForm(false)}
        />
      )}
      {attachingTodoId && (
        <AttachFileModal
          todoId={attachingTodoId}
          currentUserId={user.userId}
          onClose={() => setAttachingTodoId(null)}
        />
      )}
    </div>
  );
}
