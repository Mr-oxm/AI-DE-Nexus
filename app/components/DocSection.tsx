"use client";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';

export type DocBlock =
    | { type: "h2"; text: string }
    | { type: "h3"; text: string }
    | { type: "p"; text: string }
    | { type: "callout"; variant: "info" | "warning" | "tip" | "important"; text: string }
    | { type: "code"; lang: string; code: string }
    | { type: "list"; items: string[] }
    | { type: "table"; headers: string[]; rows: string[][] }
    | { type: "comparison"; left: { label: string; items: string[] }; right: { label: string; items: string[] } }
    | { type: "divider" };

interface DocSectionProps {
    title: string;
    subtitle?: string;
    accent: string;
    blocks: DocBlock[];
    breadcrumbHubLabel?: string;
    breadcrumbHubHref?: string;
    authorName?: string;
    authorId?: string;
    contributors?: { id: string; name: string }[];
    editHref?: string;
}

const calloutStyles = {
    info: { bg: "#1e3a5f20", border: "#3b82f640", text: "#60a5fa", label: "Note" },
    warning: { bg: "#7c2d1220", border: "#f9731640", text: "#fb923c", label: "Warning" },
    tip: { bg: "#14532d20", border: "#22c55e40", text: "#4ade80", label: "Tip" },
    important: { bg: "#2e1065 14", border: "#a855f740", text: "#c084fc", label: "Key Insight" },
};

// ── Slug a heading text ──────────────────────────────────────────────────────
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

// ── Category label map ───────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
    ml: 'ML',
    de: 'DE',
    mlops: 'MLOps',
};

// ── Breadcrumbs ──────────────────────────────────────────────────────────────
function Breadcrumbs({
    title,
    hubLabel,
    hubHref,
}: {
    title: string;
    hubLabel?: string;
    hubHref?: string;
}) {
    const pathname = usePathname();
    const parts = pathname.split('/').filter(Boolean);

    type Crumb = { label: string; href?: string };
    const crumbs: Crumb[] = [];

    if (parts.length >= 1) {
        crumbs.push({ label: 'Docs', href: '/docs' });
    }
    if (parts.length >= 2) {
        const cat = parts[1];
        crumbs.push({
            label: hubLabel ?? CATEGORY_LABELS[cat] ?? cat,
            href: hubHref ?? `/${parts[0]}/${cat}`,
        });
    }
    crumbs.push({ label: title });

    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6 flex-wrap"
        >
            {crumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 opacity-40">
                            <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                    {crumb.href ? (
                        <Link
                            href={crumb.href}
                            className="hover:text-zinc-300 transition-colors duration-150 truncate max-w-[120px]"
                        >
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className="text-zinc-300 font-medium truncate max-w-[200px]">{crumb.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}

// ── Table of Contents ────────────────────────────────────────────────────────
type TocEntry = { level: 2 | 3; text: string; id: string };

function TableOfContents({ entries, accent }: { entries: TocEntry[]; accent: string }) {
    const [open, setOpen] = useState(false);

    if (entries.length === 0) return null;

    return (
        <div
            className="rounded-xl border border-zinc-800 overflow-hidden mb-8 transition-all duration-300"
            style={{ borderColor: open ? `${accent}40` : undefined }}
        >
            {/* Header / Toggle */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/80 hover:bg-zinc-900 transition-colors duration-150 group"
                aria-expanded={open}
            >
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <rect x="1" y="2" width="11" height="1.4" rx="0.7" fill="currentColor" opacity="0.9" />
                        <rect x="1" y="5.8" width="7.5" height="1.4" rx="0.7" fill="currentColor" opacity="0.6" />
                        <rect x="1" y="9.6" width="9" height="1.4" rx="0.7" fill="currentColor" opacity="0.6" />
                    </svg>
                    Table of Contents
                    <span className="text-zinc-600 font-normal normal-case tracking-normal">({entries.length})</span>
                </span>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-zinc-500 group-hover:text-zinc-300 transition-all duration-200"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Entries — CSS max-height trick for smooth animation */}
            <div
                style={{
                    maxHeight: open ? `${entries.length * 42 + 24}px` : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <ol className="flex flex-col gap-0 py-2 px-1">
                    {entries.map((entry, i) => (
                        <li key={i}>
                            <a
                                href={`#${entry.id}`}
                                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors duration-150 group/item"
                                style={{ paddingLeft: entry.level === 3 ? '1.75rem' : undefined }}
                                onClick={() => setOpen(false)}
                            >
                                {entry.level === 2 ? (
                                    <span
                                        className="w-1.5 h-1.5 rounded-full shrink-0 opacity-80"
                                        style={{ backgroundColor: accent }}
                                    />
                                ) : (
                                    <span className="w-1 h-1 rounded-full shrink-0 bg-zinc-600 group-hover/item:bg-zinc-400 transition-colors" />
                                )}
                                <span className="leading-snug">{entry.text}</span>
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

// ── Colorized Text Block ───────────────────────────────────────────────────────
// Renders `lang: "text"` blocks with smart regex-based token coloring.
// Tokens are processed left-to-right in priority order; first match wins.

type Token = { text: string; color: string };

const TEXT_TOKENS: Array<{ re: RegExp; color: string }> = [
    // Comments / annotation lines
    { re: /^(#.*)$/m, color: "#6b7280" },  // grey
    // Indented note lines
    { re: /\b(Note|Why|Warning|Important|Remember|Tip|Key|Answer|Result|Because|Problem|Solution):/gi, color: "#f97316" }, // orange
    // Strings in quotes
    { re: /(['"` + "`" + `][^'"` + "`" + `\n]{1,60}['"` + "`" + `])/g, color: "#86efac" },  // green
    // UPPERCASE LABEL LINES
    { re: /^([A-Z][A-Z\s&\/\-]{2,}:)/gm, color: "#38bdf8" },  // sky blue
    // Section-label style (word ending with colon)
    { re: /^(\s*[A-Z][A-Za-z\s]+:)(?=\s)/gm, color: "#7dd3fc" },  // lighter blue

    // Arrows / directional symbols
    { re: /(→|←|↑|↓|⟹|⟸|>=|<=|!=|>>|<<)/g, color: "#34d399" },  // emerald
    { re: /(\-{2,}?>|<\-{2,})/g, color: "#34d399" },

    // Math functions
    { re: /\b(P|E|Var|Cov|det|log|exp|max|min|sign|cos|sin|tanh|sqrt|softmax|argmin|argmax)\b(?=\s*[(_{])/g, color: "#60a5fa" }, // blue

    // Variables with subscripts/superscripts (x₁, x², x̄₁, ŷ, wᵀ)
    { re: /([A-Za-z_][\u0300-\u036F]*[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹ᵀ]+)/g, color: "#c084fc" },
    // Variables with unicode combining marks only (x̄, ŷ, p̂)
    { re: /([A-Za-z_][\u0300-\u036F]+)/g, color: "#c084fc" },
    // Variables with underscores (e.g., x_query, x_train, cv_scores)
    { re: /\b([A-Za-z]+_[A-Za-z0-9_]+)\b/g, color: "#c084fc" },

    // Greek letters
    { re: /(α|β|γ|δ|ε|ζ|η|θ|λ|μ|ν|ξ|π|ρ|σ|τ|φ|χ|ψ|ω|Σ|Π|Δ|Γ|Λ|Ω)/g, color: "#e879f9" }, // fuchsia

    // Single uppercase letters as math variables (A, B, X, Y)
    { re: /\b([A-Z])\b/g, color: "#c084fc" },
    // Single lowercase letters (exclude 'a' and 'i' for English)
    { re: /\b([b-hj-z])\b/g, color: "#c084fc" },
    // Special rule for 'i' and 'a' if they act like variables (near operators)
    { re: /\b([ai])\b(?=\s*[-=+*/∈∉≤≥<>:\])])/g, color: "#c084fc" },
    { re: /(?<=[-=+*/∈∉≤≥<>:\[(]\s*)\b([ai])\b/g, color: "#c084fc" },

    // Numbers (standalone integers or decimals)
    { re: /(?<![A-Za-z_])(\d+\.?\d*%?)/g, color: "#fbbf24" },  // amber

    // Math operators
    { re: /(\+|-|\*|\/|=|≈|≠|∈|∉|∑|∏|∫|√|≤|≥|×|÷|∩|∪|⊂|⊃|∀|∃|∧|∨|¬|\|)/g, color: "#a78bfa" }, // violet
    // Parentheses / brackets
    { re: /([()[\]{}])/g, color: "#94a3b8" },  // slate

    // ✓ and ✗ symbols
    { re: /(✓|✔)/g, color: "#4ade80" },  // green
    { re: /(✗|✘|✕)/g, color: "#f87171" },  // red
];

function tokenizeLine(line: string): Token[] {
    const len = line.length;
    if (len === 0) return [];
    const colors = new Array<string>(len).fill("");

    for (const { re, color } of TEXT_TOKENS) {
        // Always create a fresh regex to avoid lastIndex stickiness
        const fresh = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
        let m: RegExpExecArray | null;
        while ((m = fresh.exec(line)) !== null) {
            const start = m.index;
            const end = start + m[0].length;
            for (let c = start; c < end; c++) {
                if (!colors[c]) colors[c] = color;
            }
            if (fresh.lastIndex === m.index) fresh.lastIndex++; // prevent infinite loop on zero-width match
        }
    }

    const tokens: Token[] = [];
    let i = 0;
    while (i < len) {
        const col = colors[i] || "#a1a1aa";
        let j = i + 1;
        while (j < len && (colors[j] || "#a1a1aa") === col) j++;
        tokens.push({ text: line.slice(i, j), color: col });
        i = j;
    }
    return tokens;
}

function ColorizedText({ code }: { code: string }) {
    const lines = code.split("\n");
    return (
        <pre
            style={{
                margin: 0,
                padding: "1rem 1.25rem",
                background: "#0d0d10",
                fontSize: "0.78rem",
                lineHeight: "1.75",
                overflowX: "auto",
                fontFamily: "var(--font-geist-mono, 'Fira Code', monospace)",
            }}
        >
            {lines.map((line, li) => (
                <div key={li} style={{ display: "block", minHeight: "1.21em" }}>
                    {tokenizeLine(line).map((tok, ti) => (
                        <span key={ti} style={{ color: tok.color }}>
                            {tok.text}
                        </span>
                    ))}
                </div>
            ))}
        </pre>
    );
}

// ── Scroll To Top ─────────────────────────────────────────────────────────────
function ScrollToTop({ accent }: { accent: string }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            style={{
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? 'auto' : 'none',
                transition: 'opacity 0.25s ease, box-shadow 0.2s ease, transform 0.2s ease',
                position: 'fixed',
                bottom: '1.75rem',
                right: '1.75rem',
                zIndex: 50,
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#18181b',
                border: `1px solid #3f3f46`,
                cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 2px ${accent}50`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${accent}80`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#3f3f46';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
        >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 9L7 5L11 9" stroke="#a1a1aa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export function DocSection({ title, subtitle, accent, blocks, breadcrumbHubLabel, breadcrumbHubHref, authorName, authorId, contributors = [], editHref }: DocSectionProps) {
    // Build ToC entries from h2/h3 blocks
    const tocEntries: TocEntry[] = blocks
        .filter((b) => b.type === 'h2' || b.type === 'h3')
        .map((b) => ({
            level: (b.type === 'h2' ? 2 : 3) as 2 | 3,
            text: (b as { type: 'h2' | 'h3'; text: string }).text,
            id: slugify((b as { type: 'h2' | 'h3'; text: string }).text),
        }));

    return (
        <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">

            {/* Page Header */}
            <div className="mb-8 pb-6 border-b border-zinc-800">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold text-zinc-50 tracking-tight mb-2 flex-1 min-w-0">{title}</h1>
                    {editHref && (
                        <Link
                            href={editHref}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors border border-zinc-700/50"
                        >
                            <Pencil size={12} /> Edit
                        </Link>
                    )}
                </div>
                {/* Breadcrumbs */}
                <Breadcrumbs title={title} hubLabel={breadcrumbHubLabel} hubHref={breadcrumbHubHref} />
                {subtitle && (
                    <p className="text-sm text-zinc-500 leading-relaxed mt-2">{subtitle}</p>
                )}
                {(authorName || contributors?.length) && (
                    <p className="text-xs text-zinc-600 mt-2">
                        {authorName && (
                            <>
                                by{" "}
                                {authorId ? (
                                    <Link href={`/profile/${authorId}`} className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">
                                        {authorName}
                                    </Link>
                                ) : (
                                    <span className="text-zinc-500">{authorName}</span>
                                )}
                            </>
                        )}
                        {contributors && contributors.length > 0 && (
                            <>
                                {authorName && " · "}
                                contributions from{" "}
                                {contributors.map((c, i) => (
                                    <span key={c.id}>
                                        {i > 0 && ", "}
                                        <Link href={`/profile/${c.id}`} className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">
                                            {c.name || "Unknown"}
                                        </Link>
                                    </span>
                                ))}
                            </>
                        )}
                    </p>
                )}
            </div>

            {/* Table of Contents */}
            <TableOfContents entries={tocEntries} accent={accent} />

            {/* Content */}
            <div className="space-y-5 text-zinc-400 text-sm leading-relaxed">
                {blocks.map((block, i) => {
                    if (block.type === "h2") {
                        const id = slugify(block.text);
                        return (
                            <h2
                                key={i}
                                id={id}
                                className="text-lg font-semibold text-zinc-100 mt-10 mb-1 first:mt-0 scroll-mt-20"
                                style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "12px" }}
                            >
                                {block.text}
                            </h2>
                        );
                    }
                    if (block.type === "h3") {
                        const id = slugify(block.text);
                        return (
                            <h3 key={i} id={id} className="text-sm font-semibold text-zinc-200 mt-5 mb-1 scroll-mt-20">
                                {block.text}
                            </h3>
                        );
                    }
                    if (block.type === "p") {
                        return (
                            <p key={i} className="text-sm text-zinc-400 leading-relaxed">
                                {block.text}
                            </p>
                        );
                    }
                    if (block.type === "divider") {
                        return <hr key={i} className="border-zinc-800/60 my-6" />;
                    }
                    if (block.type === "list") {
                        return (
                            <ul key={i} className="space-y-1.5 pl-1">
                                {block.items.map((item, j) => (
                                    <li key={j} className="flex gap-2.5 text-sm text-zinc-400">
                                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accent }} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        );
                    }
                    if (block.type === "callout") {
                        const s = calloutStyles[block.variant];
                        return (
                            <div
                                key={i}
                                className="rounded-lg px-4 py-3 text-sm"
                                style={{
                                    backgroundColor: s.bg,
                                    border: `1px solid ${s.border}`,
                                }}
                            >
                                <span className="font-semibold text-xs uppercase tracking-wider mr-2" style={{ color: s.text }}>
                                    {s.label}
                                </span>
                                <span className="text-zinc-400">{block.text}</span>
                            </div>
                        );
                    }
                    if (block.type === "code") {
                        const isText = block.lang === "text";
                        return (
                            <div key={i} className="rounded-xl overflow-hidden border border-zinc-800">
                                <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">{block.lang}</span>
                                </div>
                                {isText ? (
                                    <ColorizedText code={block.code} />
                                ) : (
                                    <SyntaxHighlighter
                                        language={block.lang}
                                        style={vscDarkPlus}
                                        wrapLongLines={false}
                                        wrapLines={false}
                                        codeTagProps={{
                                            style: {
                                                fontFamily: "var(--font-geist-mono, monospace)",
                                                wordBreak: "break-word",
                                                whiteSpace: "pre-wrap",
                                            }
                                        }}
                                        customStyle={{
                                            margin: 0,
                                            padding: "1rem 1.25rem",
                                            background: "#0d0d10",
                                            fontSize: "0.78rem",
                                            lineHeight: "1.7",
                                            overflowX: "hidden",
                                        }}
                                    >
                                        {block.code}
                                    </SyntaxHighlighter>
                                )}
                            </div>
                        );
                    }
                    if (block.type === "table") {
                        return (
                            <div key={i} className="overflow-x-auto rounded-xl border border-zinc-800">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-zinc-900 border-b border-zinc-800">
                                        <tr>
                                            {block.headers.map((h, j) => (
                                                <th key={j} className="px-4 py-2.5 font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/60">
                                        {block.rows.map((row, j) => (
                                            <tr key={j} className="hover:bg-zinc-900/40 transition-colors">
                                                {row.map((cell, k) => (
                                                    <td key={k} className="px-4 py-2.5 text-zinc-400">{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }
                    if (block.type === "comparison") {
                        return (
                            <div key={i} className="grid grid-cols-2 gap-3">
                                {[block.left, block.right].map((col, j) => (
                                    <div key={j} className={`rounded-xl border p-4 ${j === 0 ? "border-red-900/40 bg-red-950/10" : "border-emerald-900/40 bg-emerald-950/10"}`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${j === 0 ? "text-red-400" : "text-emerald-400"}`}>{col.label}</p>
                                        <ul className="space-y-1.5">
                                            {col.items.map((item, k) => (
                                                <li key={k} className="flex gap-2 text-xs text-zinc-400">
                                                    <span>{j === 0 ? "✗" : "✓"}</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            {/* Scroll to top */}
            <ScrollToTop accent={accent} />
        </div>
    );
}
