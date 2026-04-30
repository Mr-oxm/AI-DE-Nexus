"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, Circle, ChevronDown, ChevronUp, SlidersHorizontal, Pencil } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export type Exercise = {
    id: number;
    tag: string;
    q: string;
    a: string;
    lang?: string;
    editHref?: string;
};

interface ExerciseBankProps {
    title: string;
    description?: string;
    tagColors: Record<string, string>;
    exercises: Exercise[];
    headerSlot?: React.ReactNode;
    authorName?: string;
    authorId?: string;
}

export default function ExerciseBank({ title, description, tagColors, exercises, headerSlot, authorName, authorId }: ExerciseBankProps) {
    const [activeTag, setActiveTag] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [completed, setCompleted] = useState<Record<number, boolean>>({});
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const tags = ["ALL", ...Object.keys(tagColors)];

    const filteredExercises = exercises.filter((ex) => {
        const matchesTag = activeTag === "ALL" || ex.tag.toLowerCase() === activeTag.toLowerCase();
        const matchesSearch =
            ex.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.a.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTag && matchesSearch;
    });

    const completedCount = Object.values(completed).filter(Boolean).length;
    const progress = exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;
    const circumference = 2 * Math.PI * 22;

    const toggleComplete = (id: number) => {
        setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleExpand = (id: number) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-7 py-8 animate-in fade-in slide-in-from-bottom-2 duration-400">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                <div className="space-y-1.5 min-w-0">
                    <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">
                        {title}
                    </h1>
                    {(description || authorName) && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            {description && (
                                <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">{description}</p>
                            )}
                            {authorName && (
                                <p className="text-xs text-zinc-600">
                                    by{" "}
                                    {authorId ? (
                                        <Link href={`/profile/${authorId}`} className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">
                                            {authorName}
                                        </Link>
                                    ) : (
                                        <span className="text-zinc-500">{authorName}</span>
                                    )}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Progress widget + optional slot */}
                <div className="flex items-center gap-3 shrink-0">
                    {headerSlot}

                    {/* Circular progress */}
                    <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2.5 rounded-xl border border-zinc-800 shadow-sm">
                        <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                                <circle cx="25" cy="25" r="22" fill="none" stroke="#27272a" strokeWidth="4" />
                                <circle
                                    cx="25" cy="25" r="22" fill="none"
                                    stroke="#34d399"
                                    strokeWidth="4"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference * (1 - progress / 100)}
                                    strokeLinecap="round"
                                    className="transition-all duration-700 ease-out"
                                />
                            </svg>
                            <span className="absolute text-[10px] font-bold text-zinc-200">{progress}%</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-300 leading-tight">Progress</p>
                            <p className="text-[11px] text-zinc-600 leading-tight mt-0.5">{completedCount} / {exercises.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Controls ── */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                {/* Search */}
                <div className="relative group shrink-0 sm:w-80">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-400 transition-colors"
                        size={15}
                    />
                    <input
                        type="text"
                        placeholder="Search questions or answers..."
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg
                            focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600
                            text-sm text-zinc-200 placeholder:text-zinc-600
                            transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Tag filters - scrollable, no ugly scrollbar */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 min-w-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {tags.map((tag) => {
                        const isActive = activeTag.toLowerCase() === tag.toLowerCase();
                        const color = tag !== "ALL" ? tagColors[tag] : undefined;
                        return (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`
                                    inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap
                                    border transition-all duration-150 shrink-0
                                    ${isActive
                                        ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                                        : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900"
                                    }
                                `}
                            >
                                {color && (
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                )}
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Stats bar ── */}
            <div className="flex items-center gap-2 text-xs text-zinc-600">
                <SlidersHorizontal size={12} />
                <span>
                    {filteredExercises.length === exercises.length
                        ? `${exercises.length} items`
                        : `${filteredExercises.length} of ${exercises.length} items`}
                </span>
                {completedCount > 0 && (
                    <>
                        <span className="text-zinc-800">·</span>
                        <span className="text-emerald-500">{completedCount} completed</span>
                    </>
                )}
            </div>

            {/* ── Exercise list ── */}
            <div className="space-y-2.5">
                {filteredExercises.length === 0 ? (
                    <div className="text-center py-16 px-4 rounded-xl border border-dashed border-zinc-800">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
                            <Search className="w-5 h-5 text-zinc-600" />
                        </div>
                        <p className="text-sm font-medium text-zinc-400">No results found</p>
                        <p className="text-xs text-zinc-600 mt-1">Try a different search term or filter.</p>
                    </div>
                ) : (
                    filteredExercises.map((ex, idx) => {
                        const isCompleted = completed[ex.id];
                        const isExpanded = expanded[ex.id];
                        const tagColor = tagColors[ex.tag] || '#52525b';

                        return (
                            <div
                                key={ex.id}
                                className={`
                                    group rounded-xl border overflow-hidden transition-all duration-200
                                    ${isCompleted
                                        ? "border-emerald-900/40 bg-emerald-950/10"
                                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
                                    }
                                `}
                            >
                                {/* Question row */}
                                <div
                                    className="flex items-start gap-4 px-5 py-4 cursor-pointer"
                                    onClick={() => toggleExpand(ex.id)}
                                >
                                    {/* Left accent line */}
                                    <div
                                        className="w-0.5 self-stretch rounded-full mt-0.5 shrink-0"
                                        style={{ backgroundColor: tagColor, opacity: 0.6 }}
                                    />

                                    <div className="flex-1 min-w-0 space-y-2">
                                        {/* Tag + index */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                                                style={{
                                                    color: tagColor,
                                                    backgroundColor: `${tagColor}15`,
                                                    border: `1px solid ${tagColor}25`,
                                                }}
                                            >
                                                {ex.tag}
                                            </span>
                                            <span className="text-[11px] text-zinc-700 font-mono">#{String(idx + 1).padStart(2, '0')}</span>
                                        </div>

                                        {/* Question text */}
                                        <p className={`text-sm leading-relaxed transition-colors ${isCompleted ? "text-zinc-500 line-through decoration-zinc-700" : "text-zinc-200"}`}>
                                            {ex.q}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                        {ex.editHref && (
                                            <Link
                                                href={ex.editHref}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
                                                title="Edit"
                                            >
                                                <Pencil size={15} />
                                            </Link>
                                        )}
                                        {/* Complete toggle */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleComplete(ex.id);
                                            }}
                                            className={`p-1.5 rounded-md transition-all duration-200 ${isCompleted
                                                ? "text-emerald-400 bg-emerald-900/30"
                                                : "text-zinc-700 hover:text-emerald-500 hover:bg-emerald-900/20"
                                                }`}
                                            title={isCompleted ? "Mark incomplete" : "Mark complete"}
                                        >
                                            {isCompleted ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                                        </button>

                                        {/* Expand toggle */}
                                        <div className={`p-1.5 rounded-md transition-all duration-200 ${isExpanded ? "bg-zinc-800 text-zinc-300" : "text-zinc-600 group-hover:text-zinc-400"}`}>
                                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Answer panel */}
                                {isExpanded && (
                                    <div className="border-t border-zinc-800 bg-[#0d0d10]">
                                        <div className="overflow-hidden">
                                            <SyntaxHighlighter
                                                language={ex.lang || "python"}
                                                style={vscDarkPlus}
                                                wrapLongLines={true}
                                                wrapLines={true}
                                                codeTagProps={{
                                                    style: {
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap',
                                                        fontFamily: "var(--font-geist-mono, 'JetBrains Mono', monospace)",
                                                    }
                                                }}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '1rem 1.25rem',
                                                    background: 'transparent',
                                                    fontSize: '0.8rem',
                                                    lineHeight: '1.65',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-wrap',
                                                    overflowX: 'hidden',
                                                }}
                                            >
                                                {ex.a}
                                            </SyntaxHighlighter>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
