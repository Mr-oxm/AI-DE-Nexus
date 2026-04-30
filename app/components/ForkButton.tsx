"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GitFork, X } from "lucide-react";

type HubType = "doc" | "exercise" | "cheatsheet";

export function ForkButton({
  hubType,
  hubId,
  hubTitle,
  size = "sm",
}: {
  hubType: HubType;
  hubId: string;
  hubTitle?: string;
  size?: "sm" | "md";
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [forkTitle, setForkTitle] = useState("");

  const apiPath =
    hubType === "doc"
      ? `/api/docs/hubs/${hubId}/fork`
      : hubType === "exercise"
      ? `/api/exercises/hubs/${hubId}/fork`
      : `/api/cheatsheets/hubs/${hubId}/fork`;

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated" || !session?.user?.id) return;
    setForkTitle(hubTitle ? `${hubTitle} (copy)` : "");
    setShowModal(true);
  };

  const fork = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: forkTitle.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.href) {
        setShowModal(false);
        router.push(data.href);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? 14 : 16;
  const isSmall = size === "sm";

  if (status !== "authenticated") return null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        disabled={loading}
        className={`flex items-center gap-1 rounded-md text-zinc-500 hover:text-zinc-400 transition-colors ${
          isSmall ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
        }`}
        aria-label={`Fork ${hubTitle || "hub"}`}
      >
        <GitFork size={iconSize} />
        <span>Fork</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !loading && setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Fork hub</h3>
              <button
                type="button"
                onClick={() => !loading && setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Choose a name for your forked copy. Leave blank to use the original title.
            </p>
            <input
              type="text"
              value={forkTitle}
              onChange={(e) => setForkTitle(e.target.value)}
              placeholder={hubTitle || "My hub"}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 outline-none mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => !loading && setShowModal(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={fork}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? "Forking..." : "Fork"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
