"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AttachFileModalProps {
  todoId: Id<"todos">;
  currentUserId: Id<"users">;
  onClose: () => void;
}

export default function AttachFileModal({
  todoId,
  currentUserId,
  onClose,
}: AttachFileModalProps) {
  const createAttachment = useMutation(api.attachments.create);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError("");
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? "Upload failed");
      }

      const { url } = await response.json() as { url: string };

      await createAttachment({
        todoId,
        uploadedById: currentUserId,
        fileName: selectedFile.name,
        fileUrl: url,
        fileSize: selectedFile.size,
        contentType: selectedFile.type || "application/octet-stream",
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Attach file</h2>
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

        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {selectedFile ? (
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <svg
                className="w-10 h-10 text-gray-300 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <p className="text-sm text-gray-500">Click to choose a file</p>
              <p className="text-xs text-gray-400 mt-1">Max 4.5 MB</p>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        />

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
