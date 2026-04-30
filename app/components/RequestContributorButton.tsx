"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserPlus } from "lucide-react";

type HubType = "doc" | "exercise" | "cheatsheet";

export function RequestContributorButton({
  hubType,
  hubId,
  isAuthor,
  isContributor,
  hasPendingRequest,
  size = "sm",
}: {
  hubType: HubType;
  hubId: string;
  isAuthor: boolean;
  isContributor: boolean;
  hasPendingRequest?: boolean;
  size?: "sm" | "md";
}) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(hasPendingRequest ?? false);

  if (status !== "authenticated" || isAuthor || isContributor) return null;

  const request = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch("/api/contributor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId, hubType }),
      });
      if (res.ok) {
        setPending(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? 14 : 16;
  const isSmall = size === "sm";

  if (pending) {
    return (
      <span
        className={`flex items-center gap-1 rounded-md text-zinc-600 ${
          isSmall ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
        }`}
      >
        <UserPlus size={iconSize} />
        Pending
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={request}
      disabled={loading}
      className={`flex items-center gap-1 rounded-md text-zinc-500 hover:text-blue-400 transition-colors ${
        isSmall ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      }`}
      aria-label="Request to contribute"
    >
      <UserPlus size={iconSize} />
      Request to contribute
    </button>
  );
}
