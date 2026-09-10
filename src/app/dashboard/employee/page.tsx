"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import StatsCard from "@/components/StatsCard";
import TodoCard from "@/components/TodoCard";
import AttachFileModal from "@/components/AttachFileModal";
import { Id } from "../../../../convex/_generated/dataModel";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [attachingTodoId, setAttachingTodoId] = useState<Id<"todos"> | null>(
    null
  );
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed" | "overdue">("all");

  useEffect(() => {
    if (user && user.role !== "employee") {
      router.replace(
        user.role === "ceo" ? "/dashboard/ceo" : "/dashboard/boss"
      );
    }
  }, [user, router]);

  const myTodos = useQuery(
    api.todos.getByAssignedTo,
    user ? { userId: user.userId } : "skip"
  );

  if (!user || user.role !== "employee") return null;

  const now = Date.now();

  const filteredTodos = myTodos?.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "overdue")
      return (
        todo.expiresAt < now &&
        todo.status !== "completed" &&
        todo.status !== "cancelled"
      );
    return todo.status === filter;
  }) ?? [];

  const stats = {
    total: myTodos?.length ?? 0,
    pending: myTodos?.filter((t) => t.status === "pending").length ?? 0,
    in_progress: myTodos?.filter((t) => t.status === "in_progress").length ?? 0,
    completed: myTodos?.filter((t) => t.status === "completed").length ?? 0,
    overdue:
      myTodos?.filter(
        (t) =>
          t.expiresAt < now &&
          t.status !== "completed" &&
          t.status !== "cancelled"
      ).length ?? 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Todos</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Tasks assigned to you
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Your stats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatsCard label="Total" value={stats.total} color="blue" />
          <StatsCard label="Pending" value={stats.pending} color="yellow" />
          <StatsCard
            label="In Progress"
            value={stats.in_progress}
            color="blue"
          />
          <StatsCard label="Completed" value={stats.completed} color="green" />
          <StatsCard label="Overdue" value={stats.overdue} color="red" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Todos
          </h2>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(
              [
                "all",
                "pending",
                "in_progress",
                "completed",
                "overdue",
              ] as const
            ).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  filter === f
                    ? "bg-white text-gray-900 shadow-sm font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "in_progress"
                  ? "In progress"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredTodos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            {filter === "all"
              ? "No todos assigned to you yet."
              : `No ${filter} todos.`}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTodos.map((todo) => (
              <TodoCard
                key={todo._id}
                todo={todo}
                currentUserId={user.userId}
                canEdit={false}
                onAttachFile={(id) => setAttachingTodoId(id)}
              />
            ))}
          </div>
        )}
      </section>

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
