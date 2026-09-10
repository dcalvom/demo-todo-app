"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Id } from "../../../../convex/_generated/dataModel";

export default function UsersPage() {
  const { user } = useAuth();
  const users = useQuery(api.users.listAll);
  const departments = useQuery(api.departments.listAll);
  const updateDepartment = useMutation(api.users.updateUserDepartment);
  const updateRole = useMutation(api.users.updateUserRole);
  const deactivateUser = useMutation(api.users.deactivateUser);

  if (!user || user.role !== "ceo") {
    return (
      <div className="text-center text-gray-500 py-16">
        You do not have access to this page.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Manage all organization members
        </p>
      </div>

      {!users || users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          No users yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Department
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.name}
                    {u._id === user.userId && (
                      <span className="ml-2 text-xs text-gray-400">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    {u._id === user.userId ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium capitalize">
                        {u.role}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) =>
                          updateRole({
                            userId: u._id as Id<"users">,
                            role: e.target.value as
                              | "ceo"
                              | "boss"
                              | "employee",
                          })
                        }
                        className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      >
                        <option value="employee">Employee</option>
                        <option value="boss">Boss</option>
                        <option value="ceo">CEO</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.departmentId ?? ""}
                      onChange={(e) =>
                        updateDepartment({
                          userId: u._id as Id<"users">,
                          departmentId: e.target.value
                            ? (e.target.value as Id<"departments">)
                            : undefined,
                        })
                      }
                      className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="">No department</option>
                      {departments?.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u._id !== user.userId && (
                      <button
                        onClick={() => {
                          if (confirm(`Deactivate ${u.name}?`)) {
                            deactivateUser({
                              userId: u._id as Id<"users">,
                            });
                          }
                        }}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
