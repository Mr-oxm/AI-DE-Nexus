"use client";

import Link from "next/link";
import { ArrowUpRight, GitFork, BookOpen, Code, Database, GraduationCap, Brain } from "lucide-react";
import { StarButton } from "./StarButton";

type HubCardProps = {
  type: "doc" | "exercise" | "cheatsheet";
  hub: {
    _id: string;
    title: string;
    description?: string;
    accent?: string;
    authorId?: { _id?: string; name?: string } | string;
    forkedFrom?: { _id?: string; title?: string } | null;
    starCount?: number;
    starred?: boolean;
  };
  /** For docs: "de" | "ml" | "default" — resolved to icon inside client component */
  iconVariant?: "de" | "ml" | "default";
  /** From server when user is logged in */
  initialStarred?: boolean;
};

const targetTypeMap = {
  doc: "docHub" as const,
  exercise: "exerciseHub" as const,
  cheatsheet: "cheatsheetHub" as const,
};

const hrefMap = {
  doc: (id: string) => `/docs/${id}`,
  exercise: (id: string) => `/exercises/${id}`,
  cheatsheet: (id: string) => `/cheatsheets/${id}`,
};

const accentMap = {
  doc: "#3b82f6",
  exercise: "#10b981",
  cheatsheet: "#f59e0b",
};

const defaultIcons = { doc: BookOpen, exercise: Code, cheatsheet: Database };
const docIconVariants = { de: GraduationCap, ml: Brain, default: BookOpen };

export function HubCard({
  type,
  hub,
  iconVariant,
  initialStarred,
}: HubCardProps) {
  const accent = hub.accent || accentMap[type];
  const authorIdStr =
    typeof hub.authorId === "object" && hub.authorId && "_id" in hub.authorId
      ? String((hub.authorId as { _id?: string })._id)
      : typeof hub.authorId === "string"
      ? hub.authorId
      : null;
  const authorName =
    typeof hub.authorId === "object" && hub.authorId && "name" in hub.authorId
      ? (hub.authorId as { name?: string }).name
      : null;

  const IconComp =
    type === "doc" && iconVariant
      ? docIconVariants[iconVariant] ?? docIconVariants.default
      : defaultIcons[type];

  return (
    <div className="group flex flex-col p-5 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
        }}
      />
      <div className="flex items-start justify-between gap-2 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0"
          style={{
            backgroundColor: `${accent}12`,
            borderColor: `${accent}25`,
          }}
        >
          <IconComp size={17} style={{ color: accent }} />
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StarButton
            targetType={targetTypeMap[type]}
            targetId={hub._id}
            initialCount={hub.starCount ?? 0}
            initialStarred={initialStarred ?? hub.starred ?? false}
            useServerData
          />
          {hub.forkedFrom && (
            <span
              className="flex items-center gap-1 text-xs text-zinc-500"
              title={`Forked from ${hub.forkedFrom.title || "original"}`}
            >
              <GitFork size={12} />
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <Link href={hrefMap[type](hub._id)} className="block">
          {hub.forkedFrom && (
            <p className="text-[10px] text-zinc-600 mb-1 flex items-center gap-1">
              <GitFork size={10} /> Forked from {hub.forkedFrom.title || "original"}
            </p>
          )}
          <h2 className="text-sm font-semibold text-zinc-200 mb-1.5 group-hover:text-zinc-50 transition-colors">
            {hub.title}
          </h2>
        </Link>
        {authorName && authorIdStr && (
          <p className="text-[10px] text-zinc-500 mb-1">
            by{" "}
            <Link
              href={`/profile/${authorIdStr}`}
              className="text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-1"
            >
              {authorName}
            </Link>
          </p>
        )}
        <Link href={hrefMap[type](hub._id)} className="block">
          <p className="text-xs text-zinc-600 leading-relaxed flex-1 mb-4 line-clamp-2">
            {hub.description}
          </p>
          <div className="flex items-center gap-1 text-xs font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">
            {type === "doc" && "Browse topics"}
            {type === "exercise" && "Start practicing"}
            {type === "cheatsheet" && "View cheatsheet"}
            <ArrowUpRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </Link>
      </div>
    </div>
  );
}
