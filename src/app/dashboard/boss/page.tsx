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

export default function BossDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [attachingTodoId, setAttachingTodoId] = useState<Id<"todos"> | null>(
    null
  );

  useEffect(() => {
    if (user && user.role !== "boss") {
      router.replace(
        user.role === "ceo" ? "/dashboard/ceo" : "/dashboard/employee"
      );
    }
  }, [user, router]);

  const myDepartments = useQuery(
    api.departments.getByBoss,
    user ? { bossId: user.userId } : "skip"
  );

  const firstDept = myDepartments?.[0];
  const deptId = firstDept?._id;

  const deptTodos = useQuery(
    api.todos.getByDepartment,
    deptId ? { departmentId: deptId } : "skip"
  );

  const deptStats = useQuery(
    api.todos.getStatsByDepartment,
    deptId ? { departmentId: deptId } : "skip"
  );

  const deptUsers = useQuery(
    api.users.listByDepartment,
    deptId ? { departmentId: deptId } : "skip"
  );

  if (!user || user.role !== "boss") return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boss Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {firstDept ? firstDept.name : "No department assigned"}
          </p>
        </div>
        {deptId && (
          <button
            onClick={() => setShowTodoForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            New todo
          </button>
        )}
      </div>

      {!firstDept ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
          You are not assigned to any department as boss. Ask the CEO to assign
          you.
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Department stats
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatsCard
                label="Total"
                value={deptStats?.total ?? 0}
                color="blue"
              />
              <StatsCard
                label="Pending"
                value={deptStats?.pending ?? 0}
                color="yellow"
              />
              <StatsCard
                label="In Progress"
                value={deptStats?.in_progress ?? 0}
                color="blue"
              />
              <StatsCard
                label="Completed"
                value={deptStats?.completed ?? 0}
                color="green"
              />
              <StatsCard
                label="Cancelled"
                value={deptStats?.cancelled ?? 0}
                color="gray"
              />
              <StatsCard
                label="Overdue"
                value={deptStats?.overdue ?? 0}
                color="red"
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Team members ({deptUsers?.length ?? 0})
            </h2>
            {!deptUsers || deptUsers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
                No employees in this department yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {deptUsers.map((emp) => {
                  const empTodos =
                    deptTodos?.filter((t) => t.assignedToId === emp._id) ?? [];
                  const openTodos = empTodos.filter(
                    (t) => t.status !== "completed" && t.status !== "cancelled"
                  ).length;
                  return (
                    <div
                      key={emp._id}
                      className="bg-white rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {emp.name}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {emp.role}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {openTodos} open todo{openTodos !== 1 ? "s" : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              All department todos ({deptTodos?.length ?? 0})
            </h2>
            {!deptTodos || deptTodos.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
                No todos yet.
              </div>
            ) : (
              <div className="space-y-2">
                {deptTodos.map((todo) => (
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
        </>
      )}

      {showTodoForm && deptId && (
        <TodoForm
          currentUserId={user.userId}
          departmentId={deptId}
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
