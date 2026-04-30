"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";

type TargetType = "docHub" | "exerciseHub" | "cheatsheetHub";

export function StarButton({
  targetType,
  targetId,
  initialCount = 0,
  initialStarred = false,
  size = "sm",
  /** When true, use initialCount/initialStarred from server and skip all fetches */
  useServerData = false,
}: {
  targetType: TargetType;
  targetId: string;
  initialCount?: number;
  initialStarred?: boolean;
  size?: "sm" | "md";
  useServerData?: boolean;
}) {
  const { data: session, status } = useSession();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (useServerData) {
      setStarred(initialStarred);
      setCount(initialCount);
    }
  }, [useServerData, initialStarred, initialCount]);

  useEffect(() => {
    if (useServerData || status !== "authenticated" || !session?.user?.id) return;
    fetch(`/api/stars?targetType=${targetType}&targetId=${targetId}`)
      .then((r) => r.json())
      .then((d) => setStarred(d.starred === true));
  }, [status, session?.user?.id, targetType, targetId, useServerData]);

  // Count comes with hub data; no separate count API

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated" || !session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
      const data = await res.json();
      if (res.ok) {
        setStarred(data.starred);
        setCount((c) => (data.starred ? c + 1 : c - 1));
      }
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? 14 : 16;
  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || status !== "authenticated"}
      className={`flex items-center gap-1 rounded-md transition-colors ${
        isSmall ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      } ${
        starred
          ? "text-amber-400 hover:text-amber-300"
          : "text-zinc-500 hover:text-zinc-400"
      } ${status !== "authenticated" ? "cursor-default opacity-70" : ""}`}
      aria-label={starred ? "Unstar" : "Star"}
    >
      <Star size={iconSize} className={starred ? "fill-current" : ""} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
