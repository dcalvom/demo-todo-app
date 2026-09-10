"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Id } from "../../../../convex/_generated/dataModel";

export default function DepartmentsPage() {
  const { user } = useAuth();
  const departments = useQuery(api.departments.listAll);
  const users = useQuery(api.users.listAll);
  const createDept = useMutation(api.departments.create);
  const updateDept = useMutation(api.departments.update);
  const deactivateDept = useMutation(api.departments.deactivate);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bossId, setBossId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.role === "employee") {
    return (
      <div className="text-center text-gray-500 py-16">
        You do not have access to this page.
      </div>
    );
  }

  const bossCandidates = users?.filter((u) => u.role === "boss" || u.role === "ceo") ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await createDept({
        name,
        description: description || undefined,
        bossId: bossId ? (bossId as Id<"users">) : undefined,
      });
      setName("");
      setDescription("");
      setBossId("");
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create department");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your organization departments
          </p>
        </div>
        {user.role === "ceo" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? "Cancel" : "New department"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Create department
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Engineering, Marketing, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Short description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Boss (optional)
              </label>
              <select
                value={bossId}
                onChange={(e) => setBossId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">No boss assigned</option>
                {bossCandidates.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!departments || departments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          No departments yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const boss = users?.find((u) => u._id === dept.bossId);
            const memberCount =
              users?.filter((u) => u.departmentId === dept._id).length ?? 0;
            return (
              <DepartmentCard
                key={dept._id}
                dept={dept}
                boss={boss}
                memberCount={memberCount}
                bossCandidates={bossCandidates}
                canEdit={user.role === "ceo"}
                onUpdate={async (deptId, bossId) => {
                  await updateDept({
                    departmentId: deptId,
                    bossId: bossId ? (bossId as Id<"users">) : undefined,
                  });
                }}
                onDeactivate={async (deptId) => {
                  if (
                    confirm(
                      "Deactivate this department? This will not delete associated users or todos."
                    )
                  ) {
                    await deactivateDept({ departmentId: deptId });
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DepartmentCardProps {
  dept: {
    _id: Id<"departments">;
    name: string;
    description?: string;
    bossId?: Id<"users">;
  };
  boss?: { name: string } | null;
  memberCount: number;
  bossCandidates: Array<{ _id: Id<"users">; name: string; role: string }>;
  canEdit: boolean;
  onUpdate: (deptId: Id<"departments">, bossId: string) => Promise<void>;
  onDeactivate: (deptId: Id<"departments">) => Promise<void>;
}

function DepartmentCard({
  dept,
  boss,
  memberCount,
  bossCandidates,
  canEdit,
  onUpdate,
  onDeactivate,
}: DepartmentCardProps) {
  const [editBossId, setEditBossId] = useState(dept.bossId ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleBossChange(newBossId: string) {
    setEditBossId(newBossId);
    setIsSaving(true);
    try {
      await onUpdate(dept._id, newBossId);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div>
        <h3 className="font-medium text-gray-900">{dept.name}</h3>
        {dept.description && (
          <p className="text-xs text-gray-500 mt-0.5">{dept.description}</p>
        )}
      </div>
      <div className="text-xs text-gray-500">
        {memberCount} member{memberCount !== 1 ? "s" : ""}
      </div>
      {canEdit ? (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Boss
          </label>
          <select
            value={editBossId}
            onChange={(e) => handleBossChange(e.target.value)}
            disabled={isSaving}
            className="w-full text-sm px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white disabled:opacity-60"
          >
            <option value="">No boss assigned</option>
            {bossCandidates.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        boss && (
          <div className="text-xs text-gray-500">Boss: {boss.name}</div>
        )
      )}
      {canEdit && (
        <button
          onClick={() => onDeactivate(dept._id)}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Deactivate
        </button>
      )}
    </div>
  );
}
