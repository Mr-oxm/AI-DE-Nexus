"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Users, ArrowLeft, Loader2 } from "lucide-react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "author" | "superadmin";
  createdAt: string;
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const role = (session?.user as { role?: string })?.role;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }
    if (status === "authenticated" && role !== "admin" && role !== "superadmin") {
      router.push("/");
      return;
    }
  }, [status, role, router]);

  useEffect(() => {
    if (role !== "admin" && role !== "superadmin") return;
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(
            data.map((u: UserRow) => ({
              ...u,
              createdAt: u.createdAt
                ? new Date(u.createdAt).toLocaleDateString()
                : "",
            }))
          );
        } else {
          setError(data.error || "Failed to load users");
        }
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, [role]);

  const updateRole = async (userId: string, newRole: "admin" | "author") => {
    const target = users.find((u) => u.id === userId);
    if (target?.role === "superadmin") return;
    setUpdatingId(userId);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      setError("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === "loading" || (status === "authenticated" && role !== "admin" && role !== "superadmin")) {
    return (
      <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="px-6 md:px-10 py-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="mb-10 space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-zinc-50 tracking-tight">
          <Shield className="text-amber-500" /> Admin Dashboard
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
          Manage users and their roles. Admins can create hubs, edit any content, and promote users.
        </p>
      </div>

      <div className="border-t border-zinc-800 mb-8" />

      <section>
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-4">
          <Users size={14} /> Users ({users.length})
        </h2>

        {error && (
          <p className="text-sm text-red-400 mb-4">{error}</p>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-zinc-500 py-8">
            <Loader2 size={18} className="animate-spin" />
            Loading users...
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/80 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-zinc-400 uppercase tracking-wider text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-zinc-200">{u.name}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          u.role === "superadmin"
                            ? "bg-amber-600/30 text-amber-300 border border-amber-500/50"
                            : u.role === "admin"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{u.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      {u.role === "superadmin" ? (
                        <span className="text-xs text-zinc-600">(protected)</span>
                      ) : u.id === session.user?.id ? (
                        <span className="text-xs text-zinc-600">(you)</span>
                      ) : updatingId === u.id ? (
                        <Loader2 size={14} className="animate-spin inline text-zinc-500" />
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => updateRole(u.id, "admin")}
                            disabled={u.role === "admin"}
                            className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Make admin
                          </button>
                          <button
                            onClick={() => updateRole(u.id, "author")}
                            disabled={u.role === "author"}
                            className="px-2 py-1 rounded text-xs font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Make author
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
