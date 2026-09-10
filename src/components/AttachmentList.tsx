"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AttachmentListProps {
  todoId: Id<"todos">;
  currentUserId: Id<"users">;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({
  todoId,
  currentUserId,
}: AttachmentListProps) {
  const attachments = useQuery(api.attachments.getByTodo, { todoId });
  const removeAttachment = useMutation(api.attachments.remove);

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Attachments
      </p>
      {attachments.map((att) => (
        <div
          key={att._id}
          className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <svg
              className="w-4 h-4 text-gray-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <a
              href={att.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline truncate"
            >
              {att.fileName}
            </a>
            <span className="text-xs text-gray-400 shrink-0">
              {formatFileSize(att.fileSize)}
            </span>
          </div>
          {att.uploadedById === currentUserId && (
            <button
              onClick={() => removeAttachment({ attachmentId: att._id })}
              className="text-xs text-red-400 hover:text-red-600 shrink-0"
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
