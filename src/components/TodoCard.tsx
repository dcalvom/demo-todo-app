"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import AttachmentList from "./AttachmentList";

const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

interface TodoCardProps {
  todo: Doc<"todos">;
  currentUserId: Id<"users">;
  canEdit: boolean;
  onAttachFile?: (todoId: Id<"todos">) => void;
}

export default function TodoCard({
  todo,
  currentUserId,
  canEdit,
  onAttachFile,
}: TodoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const updateTodo = useMutation(api.todos.update);
  const deleteTodo = useMutation(api.todos.remove);

  const isOverdue =
    todo.expiresAt < Date.now() &&
    todo.status !== "completed" &&
    todo.status !== "cancelled";

  const expiryDate = new Date(todo.expiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  async function handleStatusChange(
    newStatus: "pending" | "in_progress" | "completed" | "cancelled"
  ) {
    await updateTodo({ todoId: todo._id, status: newStatus });
  }

  async function handleDelete() {
    if (confirm("Delete this todo?")) {
      await deleteTodo({ todoId: todo._id });
    }
  }

  const canChangeStatus =
    canEdit || todo.assignedToId === currentUserId;

  return (
    <div
      className={`bg-white rounded-xl border ${
        isOverdue ? "border-red-200" : "border-gray-200"
      } p-4 space-y-3`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-medium text-gray-900 truncate ${
                todo.status === "completed" ? "line-through text-gray-400" : ""
              }`}
            >
              {todo.title}
            </h3>
            {isOverdue && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[todo.status]}`}
            >
              {STATUS_LABELS[todo.status]}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[todo.priority]}`}
            >
              {todo.priority}
            </span>
            <span className="text-xs text-gray-500">Due {expiryDate}</span>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 text-sm shrink-0"
        >
          {isExpanded ? "Less" : "More"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {todo.description && (
            <p className="text-sm text-gray-600">{todo.description}</p>
          )}

          {canChangeStatus && todo.status !== "completed" && (
            <div className="flex gap-2 flex-wrap">
              {todo.status !== "in_progress" && (
                <button
                  onClick={() => handleStatusChange("in_progress")}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Mark In Progress
                </button>
              )}
              {todo.status !== "pending" && (
                <button
                  onClick={() => handleStatusChange("pending")}
                  className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  Mark Pending
                </button>
              )}
              <button
                onClick={() => handleStatusChange("completed")}
                className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                Mark Complete
              </button>
              {canEdit && (
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {todo.status === "completed" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange("pending")}
                className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                Reopen
              </button>
            </div>
          )}

          <AttachmentList todoId={todo._id} currentUserId={currentUserId} />

          {onAttachFile && (
            <button
              onClick={() => onAttachFile(todo._id)}
              className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Attach file
            </button>
          )}

          {canEdit && (
            <div className="flex justify-end">
              <button
                onClick={handleDelete}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Delete todo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
