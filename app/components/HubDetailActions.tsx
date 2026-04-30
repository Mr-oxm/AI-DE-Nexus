"use client";

import { GitFork } from "lucide-react";
import { StarButton } from "./StarButton";
import { ForkButton } from "./ForkButton";
import { RequestContributorButton } from "./RequestContributorButton";
import { DeleteHubButton } from "./DeleteHubButton";

type HubType = "doc" | "exercise" | "cheatsheet";

export function HubDetailActions({
  hubType,
  hubId,
  hubTitle,
  authorId,
  contributorIds = [],
  sessionUserId,
  forkedFrom,
  starCount,
  starred,
}: {
  hubType: HubType;
  hubId: string;
  hubTitle?: string;
  authorId?: string;
  contributorIds?: string[];
  sessionUserId?: string | null;
  forkedFrom?: { title?: string } | null;
  starCount?: number;
  starred?: boolean;
}) {
  const targetType =
    hubType === "doc" ? "docHub" : hubType === "exercise" ? "exerciseHub" : "cheatsheetHub";
  const isAuthor = sessionUserId === authorId;
  const isContributor = contributorIds.includes(sessionUserId ?? "");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {forkedFrom && (
        <span
          className="flex items-center gap-1.5 text-xs text-zinc-500"
          title={`Forked from ${forkedFrom.title || "original"}`}
        >
          <GitFork size={14} /> Forked from {forkedFrom.title || "original"}
        </span>
      )}
      <StarButton
        targetType={targetType}
        targetId={hubId}
        size="md"
        initialCount={starCount}
        initialStarred={starred}
        useServerData={starCount !== undefined}
      />
      <ForkButton hubType={hubType} hubId={hubId} hubTitle={hubTitle} size="md" />
      <RequestContributorButton
        hubType={hubType}
        hubId={hubId}
        isAuthor={isAuthor}
        isContributor={isContributor}
        size="md"
      />
      <DeleteHubButton
        hubType={hubType}
        hubId={hubId}
        hubTitle={hubTitle || "hub"}
        isAuthor={isAuthor}
        size="md"
      />
    </div>
  );
}
