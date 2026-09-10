"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface TodoFormProps {
  currentUserId: Id<"users">;
  departmentId?: Id<"departments">;
  onClose: () => void;
}

export default function TodoForm({
  currentUserId,
  departmentId: defaultDeptId,
  onClose,
}: TodoFormProps) {
  const createTodo = useMutation(api.todos.create);
  const departments = useQuery(api.departments.listAll);
  const users = useQuery(api.users.listAll);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [assignedToId, setAssignedToId] = useState(currentUserId);
  const [selectedDeptId, setSelectedDeptId] = useState(defaultDeptId ?? "");
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const deptUsers = users?.filter(
    (u) =>
      !selectedDeptId || u.departmentId === selectedDeptId || u._id === currentUserId
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDeptId) {
      setError("Please select a department");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await createTodo({
        title,
        description: description || undefined,
        priority,
        assignedToId: assignedToId as Id<"users">,
        assignedById: currentUserId,
        departmentId: selectedDeptId as Id<"departments">,
        expiresAt: new Date(expiresAt).getTime(),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create todo");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">New todo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
              placeholder="Additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due date
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          {!defaultDeptId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">Select department</option>
                {departments?.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to
            </label>
            <select
              value={assignedToId}
              onChange={(e) =>
                setAssignedToId(e.target.value as Id<"users">)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              {deptUsers?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} {user._id === currentUserId ? "(me)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Creating..." : "Create todo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
