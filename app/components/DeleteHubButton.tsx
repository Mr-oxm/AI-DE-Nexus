"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";

type HubType = "doc" | "exercise" | "cheatsheet";

export function DeleteHubButton({
  hubType,
  hubId,
  hubTitle,
  isAuthor,
  size = "sm",
}: {
  hubType: HubType;
  hubId: string;
  hubTitle: string;
  isAuthor: boolean;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiPath =
    hubType === "doc"
      ? `/api/docs/hubs/${hubId}`
      : hubType === "exercise"
      ? `/api/exercises/hubs/${hubId}`
      : `/api/cheatsheets/hubs/${hubId}`;

  const redirectPath =
    hubType === "doc" ? "/docs" : hubType === "exercise" ? "/exercises" : "/cheatsheets";

  const isConfirmed = confirmText.trim() === hubTitle;
  const iconSize = size === "sm" ? 14 : 16;

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmText("");
    setError("");
    setShowModal(true);
  };

  const deleteHub = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isConfirmed || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiPath, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        router.push(redirectPath);
      } else {
        setError(data.error || "Failed to delete");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (!isAuthor) return null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`flex items-center gap-1 rounded-md text-zinc-500 hover:text-red-400 transition-colors ${
          size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
        }`}
        aria-label={`Delete ${hubTitle}`}
      >
        <Trash2 size={iconSize} />
        <span>Delete</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !loading && setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-red-900/50 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Delete this hub?</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  This action cannot be undone. All topics, exercises, or sections in this hub will
                  be permanently removed.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mb-2">
              Type <span className="font-mono font-semibold text-zinc-300">{hubTitle}</span> to
              confirm.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Hub name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-red-500 outline-none mb-4 font-mono"
              autoFocus
              autoComplete="off"
            />

            {error && (
              <p className="text-xs text-red-400 mb-4">{error}</p>
            )}

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
                onClick={deleteHub}
                disabled={!isConfirmed || loading}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete hub"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
