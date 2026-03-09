import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
}

const calloutStyles = {
    info: { bg: "#1e3a5f20", border: "#3b82f640", text: "#60a5fa", label: "Note" },
    warning: { bg: "#7c2d1220", border: "#f9731640", text: "#fb923c", label: "Warning" },
    tip: { bg: "#14532d20", border: "#22c55e40", text: "#4ade80", label: "Tip" },
    important: { bg: "#2e1065 14", border: "#a855f740", text: "#c084fc", label: "Key Insight" },
};

export function DocSection({ title, subtitle, accent, blocks }: DocSectionProps) {
    return (
        <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Page Header */}
            <div className="mb-8 pb-6 border-b border-zinc-800">
                <h1 className="text-2xl font-bold text-zinc-50 tracking-tight mb-2">{title}</h1>
                {subtitle && <p className="text-sm text-zinc-500 leading-relaxed">{subtitle}</p>}
            </div>

            {/* Content */}
            <div className="space-y-5 text-zinc-400 text-sm leading-relaxed">
                {blocks.map((block, i) => {
                    if (block.type === "h2") {
                        return (
                            <h2
                                key={i}
                                className="text-lg font-semibold text-zinc-100 mt-10 mb-1 first:mt-0"
                                style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "12px" }}
                            >
                                {block.text}
                            </h2>
                        );
                    }
                    if (block.type === "h3") {
                        return (
                            <h3 key={i} className="text-sm font-semibold text-zinc-200 mt-5 mb-1">
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
                        return (
                            <div key={i} className="rounded-xl overflow-hidden border border-zinc-800">
                                <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">{block.lang}</span>
                                </div>
                                <SyntaxHighlighter
                                    language={block.lang}
                                    style={vscDarkPlus}
                                    wrapLongLines
                                    wrapLines
                                    codeTagProps={{ style: { fontFamily: "var(--font-geist-mono, monospace)", wordBreak: "break-word", whiteSpace: "pre-wrap" } }}
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
        </div>
    );
}
