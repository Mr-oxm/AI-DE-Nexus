"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, UserPlus, Check, X, ArrowLeft } from "lucide-react";

type InboxItem = {
  id: string;
  hubId: string;
  hubType: string;
  hubTitle?: string;
  user: { name?: string; email?: string };
  status: string;
  createdAt: string;
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/notifications");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/contributor-requests?mode=inbox")
        .then((r) => r.json())
        .then((data) => setItems(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const approve = async (id: string) => {
    const res = await fetch(`/api/contributor-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const reject = async (id: string) => {
    const res = await fetch(`/api/contributor-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const hubHref = (hubType: string, hubId: string) =>
    hubType === "doc"
      ? `/docs/${hubId}`
      : hubType === "exercise"
      ? `/exercises/${hubId}`
      : `/cheatsheets/${hubId}`;

  if (status === "loading" || !session) {
    return (
      <div className="px-6 md:px-10 py-12 max-w-2xl mx-auto">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="mb-10 space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-zinc-50 tracking-tight">
          <Bell className="text-amber-500" /> Notifications
        </h1>
        <p className="text-sm text-zinc-500">
          Pending requests to contribute to your hubs.
        </p>
      </div>

      <div className="border-t border-zinc-800 mb-8" />

      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center text-zinc-500">
          <UserPlus size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No pending contributor requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200">
                  {(item.user as { name?: string }).name || (item.user as { email?: string }).email} requested to contribute
                </p>
                <Link
                  href={hubHref(item.hubType, item.hubId)}
                  className="text-xs text-zinc-500 hover:text-zinc-400 truncate block"
                >
                  {item.hubTitle} ({item.hubType})
                </Link>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => approve(item.id)}
                  className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  aria-label="Approve"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => reject(item.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  aria-label="Reject"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
