"use client";

import { useState } from "react";
import { DocBlock, DocSection } from "@/app/components/DocSection";
import { Copy, Plus, Trash2, ArrowLeft, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

export default function DocWizard() {
    const [title, setTitle] = useState("New Documentation Page");
    const [subtitle, setSubtitle] = useState("Enter an engaging subtitle here.");
    const [accent, setAccent] = useState("#3b82f6");
    const [blocks, setBlocks] = useState<DocBlock[]>([]);
    const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

    const addBlock = (type: DocBlock["type"]) => {
        let newBlock: any = { type };
        if (type === "h2" || type === "h3" || type === "p") newBlock.text = "";
        if (type === "callout") { newBlock.variant = "info"; newBlock.text = ""; }
        if (type === "code") { newBlock.lang = "sql"; newBlock.code = ""; }
        if (type === "list") newBlock.items = [""];
        if (type === "table") { newBlock.headers = ["Col 1", "Col 2"]; newBlock.rows = [["Val 1", "Val 2"]]; }
        if (type === "comparison") {
            newBlock.left = { label: "Bad", items: [""] };
            newBlock.right = { label: "Good", items: [""] };
        }
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (idx: number, updates: any) => {
        const newBlocks = [...blocks];
        newBlocks[idx] = { ...newBlocks[idx], ...updates };
        setBlocks(newBlocks);
    };

    const removeBlock = (idx: number) => {
        setBlocks(blocks.filter((_, i) => i !== idx));
    };

    const moveBlock = (idx: number, dir: -1 | 1) => {
        if (idx + dir < 0 || idx + dir >= blocks.length) return;
        const newBlocks = [...blocks];
        const temp = newBlocks[idx];
        newBlocks[idx] = newBlocks[idx + dir];
        newBlocks[idx + dir] = temp;
        setBlocks(newBlocks);
    };

    const generateCode = () => {
        const code = `import { DocBlock } from "@/app/components/DocSection";

export const data = {
    title: ${JSON.stringify(title)},
    subtitle: ${JSON.stringify(subtitle)},
    accent: ${JSON.stringify(accent)},
    blocks: ${JSON.stringify(blocks, null, 4).replace(/"(type|text|variant|lang|code|items|headers|rows|left|right|label)":/g, "$1:")} as DocBlock[]
};
`;
        navigator.clipboard.writeText(code);
        alert("TypeScript code copied to clipboard!");
    };

    return (
        <div className="flex flex-col h-screen bg-black text-zinc-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-900 bg-zinc-950 shrink-0 gap-2">
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <Link href="/wizard" className="text-zinc-500 hover:text-zinc-200"><ArrowLeft size={18} /></Link>
                    <h1 className="font-semibold text-zinc-100 text-sm md:text-base truncate max-w-[150px] sm:max-w-none">Doc Page Wizard</h1>
                </div>
                <button
                    onClick={generateCode}
                    className="flex shrink-0 items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs md:text-sm font-medium transition-colors"
                >
                    <Copy size={16} /> <span className="hidden sm:inline">Export Code</span>
                </button>
            </div>

            {/* Split View */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* Mobile Tab Bar */}
                <div className="flex lg:hidden bg-zinc-900 shrink-0 border-b border-zinc-800">
                    <button onClick={() => setMobileTab("editor")} className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mobileTab === 'editor' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}>EDITOR</button>
                    <button onClick={() => setMobileTab("preview")} className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mobileTab === 'preview' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}>LIVE PREVIEW</button>
                </div>

                {/* Left Panel: Editor */}
                <div className={`w-full lg:w-1/2 lg:flex flex-col border-r border-zinc-900 bg-zinc-950 overflow-y-auto p-4 md:p-6 space-y-8 ${mobileTab === 'editor' ? 'flex' : 'hidden'}`}>

                    {/* Metadata Section */}
                    <div className="space-y-4 bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/60">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">Page Settings</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">Subtitle</label>
                                <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" rows={2} />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">Accent Hex Color (e.g. #3b82f6 for blue)</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-10 h-10 p-1 bg-zinc-900 rounded border border-zinc-800 cursor-pointer" />
                                    <input value={accent} onChange={e => setAccent(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blocks List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Content Blocks ({blocks.length})</h2>
                        </div>

                        {blocks.map((block, i) => (
                            <div key={i} className="group relative bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 transition-all">
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={() => moveBlock(i, -1)} className="p-1.5 text-zinc-500 hover:text-blue-400 bg-zinc-800 rounded"><ArrowUp size={14} /></button>
                                    <button onClick={() => moveBlock(i, 1)} className="p-1.5 text-zinc-500 hover:text-blue-400 bg-zinc-800 rounded"><ArrowDown size={14} /></button>
                                    <button onClick={() => removeBlock(i)} className="p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-800 rounded ml-1"><Trash2 size={14} /></button>
                                </div>

                                <span className="inline-block px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono mb-3 uppercase tracking-wider">
                                    {block.type}
                                </span>

                                {(block.type === 'h2' || block.type === 'h3' || block.type === 'p') && (
                                    <textarea
                                        value={block.text}
                                        onChange={e => updateBlock(i, { text: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm font-mono min-h-[60px] outline-none focus:border-blue-500"
                                        placeholder={`Enter ${block.type} text...`}
                                    />
                                )}

                                {block.type === 'callout' && (
                                    <div className="space-y-2">
                                        <select value={block.variant} onChange={e => updateBlock(i, { variant: e.target.value })} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm outline-none">
                                            <option value="info">Info (Blue)</option>
                                            <option value="warning">Warning (Orange)</option>
                                            <option value="tip">Tip (Green)</option>
                                            <option value="important">Important (Purple)</option>
                                        </select>
                                        <textarea value={block.text} onChange={e => updateBlock(i, { text: e.target.value })} className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm outline-none" rows={2} />
                                    </div>
                                )}

                                {block.type === 'code' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-zinc-500">Language:</span>
                                            <select value={block.lang} onChange={e => updateBlock(i, { lang: e.target.value })} className="w-48 bg-black border border-zinc-800 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500">
                                                <option value="sql">SQL</option>
                                                <option value="python">Python</option>
                                                <option value="bash">Bash / Shell</option>
                                                <option value="text">Text (Custom Smart Formatting)</option>
                                                <option value="javascript">JavaScript</option>
                                                <option value="typescript">TypeScript</option>
                                                <option value="json">JSON</option>
                                                <option value="yaml">YAML</option>
                                                <option value="html">HTML</option>
                                                <option value="css">CSS</option>
                                            </select>
                                        </div>
                                        <textarea value={block.code} onChange={e => updateBlock(i, { code: e.target.value })} className="w-full bg-[#0d0d10] text-[#d4d4d4] border border-zinc-800 rounded px-3 py-3 text-sm font-mono whitespace-pre outline-none focus:border-blue-500" rows={5} />
                                    </div>
                                )}

                                {block.type === 'list' && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500">Items (one per line):</label>
                                        <textarea
                                            value={block.items.join("\n")}
                                            onChange={e => updateBlock(i, { items: e.target.value.split("\n") })}
                                            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                                            rows={4}
                                        />
                                    </div>
                                )}

                                {block.type === 'table' && (
                                    <div className="space-y-2">
                                        <div className="text-xs text-zinc-500 mb-2">Edit as CSV (pipe-separated |)</div>
                                        <textarea
                                            value={[block.headers.join(" | "), ...block.rows.map(r => r.join(" | "))].join("\n")}
                                            onChange={e => {
                                                const lines = e.target.value.split("\n");
                                                const headers = (lines[0] || "").split("|").map(s => s.trim());
                                                const rows = lines.slice(1).map(l => l.split("|").map(s => s.trim()));
                                                updateBlock(i, { headers, rows });
                                            }}
                                            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm font-mono whitespace-pre outline-none focus:border-blue-500"
                                            rows={6}
                                        />
                                    </div>
                                )}

                                {block.type === 'comparison' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <input value={block.left.label} onChange={e => updateBlock(i, { left: { ...block.left, label: e.target.value } })} className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs font-bold text-red-400 mb-2" />
                                            <textarea value={block.left.items.join("\n")} onChange={e => updateBlock(i, { left: { ...block.left, items: e.target.value.split("\n") } })} className="w-full bg-black border border-zinc-800 rounded px-2 py-2 text-xs h-24" />
                                        </div>
                                        <div>
                                            <input value={block.right.label} onChange={e => updateBlock(i, { right: { ...block.right, label: e.target.value } })} className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs font-bold text-emerald-400 mb-2" />
                                            <textarea value={block.right.items.join("\n")} onChange={e => updateBlock(i, { right: { ...block.right, items: e.target.value.split("\n") } })} className="w-full bg-black border border-zinc-800 rounded px-2 py-2 text-xs h-24" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex flex-wrap gap-2 pt-2">
                            {["h2", "h3", "p", "callout", "code", "list", "table", "comparison", "divider"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => addBlock(t as any)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/50 rounded-md text-xs font-medium text-zinc-300 transition-colors"
                                >
                                    <Plus size={12} /> {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Live Preview */}
                <div className={`w-full lg:w-1/2 lg:block bg-[#050505] overflow-y-auto ${mobileTab === 'preview' ? 'block' : 'hidden'}`}>
                    <DocSection title={title} subtitle={subtitle} accent={accent} blocks={blocks} />
                </div>
            </div>
        </div>
    );
}
