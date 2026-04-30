"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DocBlock, DocSection } from "@/app/components/DocSection";
import { Copy, Plus, Trash2, ArrowLeft, ArrowUp, ArrowDown, Save, FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

type DocHub = { _id: string; title: string };

const DOC_TOPIC_JSON_SCHEMA = `{
  "title": "string (required)",
  "subtitle": "string (optional)",
  "accent": "#3b82f6 (optional, hex color)",
  "blocks": [
    { "type": "h2", "text": "string" },
    { "type": "h3", "text": "string" },
    { "type": "p", "text": "string" },
    { "type": "callout", "variant": "info|warning|tip|important", "text": "string" },
    { "type": "code", "lang": "sql|python|bash|text|javascript|json|yaml", "code": "string" },
    { "type": "list", "items": ["string"] },
    { "type": "table", "headers": ["Col1", "Col2"], "rows": [["A", "B"]] },
    { "type": "comparison", "left": { "label": "Bad", "items": ["item"] }, "right": { "label": "Good", "items": ["item"] } },
    { "type": "divider" }
  ]
}`;

const DOC_TOPIC_JSON_EXAMPLE = `{
  "title": "Introduction to SQL",
  "subtitle": "Learn the basics of structured query language.",
  "accent": "#3b82f6",
  "blocks": [
    { "type": "h2", "text": "What is SQL?" },
    { "type": "p", "text": "SQL (Structured Query Language) is a domain-specific language used for managing relational databases." },
    { "type": "h3", "text": "Basic Syntax" },
    { "type": "code", "lang": "sql", "code": "SELECT * FROM users WHERE active = true;" },
    { "type": "callout", "variant": "tip", "text": "Always use parameterized queries to prevent SQL injection." },
    { "type": "divider" }
  ]
}`;

function parseDocTopicJson(jsonStr: string): { ok: true; data: { title: string; subtitle?: string; accent?: string; blocks: DocBlock[] } } | { ok: false; error: string } {
    try {
        const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
        if (!parsed || typeof parsed !== "object") {
            return { ok: false, error: "JSON must be an object" };
        }
        const title = parsed.title;
        if (typeof title !== "string" || !title.trim()) {
            return { ok: false, error: "title (string) is required" };
        }
        const blocks = parsed.blocks;
        if (!Array.isArray(blocks)) {
            return { ok: false, error: "blocks must be an array" };
        }
        const validTypes = ["h2", "h3", "p", "callout", "code", "list", "table", "comparison", "divider"];
        const validated: DocBlock[] = [];
        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            if (!b || typeof b !== "object" || !("type" in b)) {
                return { ok: false, error: `blocks[${i}]: missing type` };
            }
            const t = (b as { type: string }).type;
            if (!validTypes.includes(t)) {
                return { ok: false, error: `blocks[${i}]: invalid type "${t}"` };
            }
            if (t === "h2" || t === "h3" || t === "p") {
                validated.push({ type: t, text: String((b as { text?: unknown }).text ?? "") });
            } else if (t === "callout") {
                const v = (b as { variant?: string }).variant ?? "info";
                if (!["info", "warning", "tip", "important"].includes(v)) {
                    return { ok: false, error: `blocks[${i}]: callout variant must be info|warning|tip|important` };
                }
                validated.push({ type: "callout", variant: v as "info" | "warning" | "tip" | "important", text: String((b as { text?: unknown }).text ?? "") });
            } else if (t === "code") {
                validated.push({
                    type: "code",
                    lang: String((b as { lang?: string }).lang ?? "sql"),
                    code: String((b as { code?: unknown }).code ?? ""),
                });
            } else if (t === "list") {
                const items = (b as { items?: unknown }).items;
                validated.push({ type: "list", items: Array.isArray(items) ? items.map(String) : [] });
            } else if (t === "table") {
                const headers = (b as { headers?: unknown }).headers;
                const rows = (b as { rows?: unknown }).rows;
                const validRows = Array.isArray(rows)
                    ? rows.map((r) => (Array.isArray(r) ? r.map(String) : []))
                    : [];
                validated.push({
                    type: "table",
                    headers: Array.isArray(headers) ? headers.map(String) : [],
                    rows: validRows,
                });
            } else if (t === "comparison") {
                const left = (b as { left?: { label?: string; items?: string[] } }).left;
                const right = (b as { right?: { label?: string; items?: string[] } }).right;
                validated.push({
                    type: "comparison",
                    left: {
                        label: left?.label ?? "Bad",
                        items: Array.isArray(left?.items) ? left.items.map(String) : [],
                    },
                    right: {
                        label: right?.label ?? "Good",
                        items: Array.isArray(right?.items) ? right.items.map(String) : [],
                    },
                });
            } else {
                validated.push({ type: "divider" });
            }
        }
        return {
            ok: true,
            data: {
                title: title.trim(),
                subtitle: typeof parsed.subtitle === "string" ? parsed.subtitle.trim() : undefined,
                accent: typeof parsed.accent === "string" ? parsed.accent : "#3b82f6",
                blocks: validated,
            },
        };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
}

export default function DocWizard() {
    const [hubs, setHubs] = useState<DocHub[]>([]);
    const [selectedHubId, setSelectedHubId] = useState("");
    const [title, setTitle] = useState("New Documentation Page");
    const [subtitle, setSubtitle] = useState("Enter an engaging subtitle here.");
    const [accent, setAccent] = useState("#3b82f6");
    const [blocks, setBlocks] = useState<DocBlock[]>([]);
    const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [inputMode, setInputMode] = useState<"ui" | "json">("ui");
    const [jsonInput, setJsonInput] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const editTopicId = searchParams.get("editTopicId");
    const hubIdParam = searchParams.get("hubId");

    useEffect(() => {
        if (editTopicId) {
            fetch(`/api/docs/topics/${editTopicId}`)
                .then((r) => r.json())
                .then((topic) => {
                    if (topic && !topic.error) {
                        setTitle(topic.title || "");
                        setSubtitle(topic.subtitle || "");
                        setAccent(topic.accent || "#3b82f6");
                        setBlocks(topic.blocks || []);
                        if (topic.hubId) setSelectedHubId(String(topic.hubId));
                    }
                });
        }
    }, [editTopicId]);

    useEffect(() => {
        if (inputMode !== "json" || !jsonInput.trim()) {
            setJsonError(null);
            return;
        }
        const result = parseDocTopicJson(jsonInput);
        if (result.ok) {
            setTitle(result.data.title);
            setSubtitle(result.data.subtitle ?? "");
            setAccent(result.data.accent ?? "#3b82f6");
            setBlocks(result.data.blocks);
            setJsonError(null);
        } else {
            setJsonError(result.error);
        }
    }, [jsonInput, inputMode]);

    useEffect(() => {
        fetch("/api/docs/hubs?editable=true")
            .then((r) => r.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setHubs(list);
                if (hubIdParam && list.some((h: { _id: string }) => h._id === hubIdParam)) {
                    setSelectedHubId(hubIdParam);
                } else if (list.length > 0) {
                    setSelectedHubId((prev) => prev || list[0]._id);
                }
            });
    }, [hubIdParam]);

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

    const saveToDb = async () => {
        setSaveError("");
        if (!selectedHubId) {
            setSaveError("Select a doc hub first");
            return;
        }
        if (!title.trim()) {
            setSaveError("Title is required");
            return;
        }
        setSaving(true);
        try {
            if (editTopicId) {
                const res = await fetch(`/api/docs/topics/${editTopicId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title.trim(),
                        subtitle: subtitle.trim(),
                        accent,
                        blocks,
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setSaveError(data.error || "Failed to update");
                    setSaving(false);
                    return;
                }
                router.push(`/docs/${selectedHubId}/${editTopicId}`);
            } else {
                const res = await fetch("/api/docs/topics", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        hubId: selectedHubId,
                        title: title.trim(),
                        subtitle: subtitle.trim(),
                        accent,
                        blocks,
                    }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setSaveError(data.error || "Failed to save");
                    setSaving(false);
                    return;
                }
                router.push(`/docs/${selectedHubId}/${data._id}`);
            }
        } catch {
            setSaveError("Something went wrong");
            setSaving(false);
        }
    };

    const deleteTopic = async () => {
        if (!editTopicId || !confirm("Delete this topic? This cannot be undone.")) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/docs/topics/${editTopicId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                setSaveError(data.error || "Failed to delete");
                setSaving(false);
                return;
            }
            router.push(`/docs/${selectedHubId}`);
        } catch {
            setSaveError("Something went wrong");
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-900 bg-zinc-950 shrink-0 gap-2">
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <Link href="/wizard" className="text-zinc-500 hover:text-zinc-200"><ArrowLeft size={18} /></Link>
                    <h1 className="font-semibold text-zinc-100 text-sm md:text-base truncate max-w-[150px] sm:max-w-none">Doc Page Wizard</h1>
                </div>
                <div className="flex items-center gap-2">
                    {editTopicId && (
                        <button
                            onClick={deleteTopic}
                            disabled={saving}
                            className="flex shrink-0 items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-900/60 hover:bg-red-800/80 text-red-300 border border-red-800/60 rounded-md text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                        </button>
                    )}
                    <button
                        onClick={saveToDb}
                            disabled={saving || !selectedHubId}
                        className="flex shrink-0 items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <Save size={16} /> <span className="hidden sm:inline">{saving ? "Saving..." : editTopicId ? "Update" : "Save to DB"}</span>
                    </button>
                    <button
                        onClick={generateCode}
                        className="flex shrink-0 items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md text-xs md:text-sm font-medium transition-colors"
                    >
                        <Copy size={16} /> <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
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

                    {/* Input Mode Toggle: UI vs JSON */}
                    <div className="flex gap-2 p-1 rounded-lg bg-zinc-900/60 border border-zinc-800/60 w-fit">
                        <button
                            onClick={() => setInputMode("ui")}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${inputMode === "ui" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            Build with UI
                        </button>
                        <button
                            onClick={() => {
                                setInputMode("json");
                                setJsonInput(JSON.stringify({ title, subtitle, accent, blocks }, null, 2));
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${inputMode === "json" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                        >
                            <FileJson size={14} /> Paste JSON
                        </button>
                    </div>

                    {inputMode === "json" && (
                        <div className="space-y-3 bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/60">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                    <FileJson size={16} /> JSON Input
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(DOC_TOPIC_JSON_SCHEMA);
                                            alert("Schema copied!");
                                        }}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                                    >
                                        <Copy size={12} /> Schema
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(DOC_TOPIC_JSON_EXAMPLE);
                                            alert("Example copied!");
                                        }}
                                        className="text-xs text-zinc-400 hover:text-zinc-300 font-medium flex items-center gap-1"
                                    >
                                        <Copy size={12} /> Example
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Paste your JSON below. Preview updates when valid. Schema for reference:
                            </p>
                            <pre className="text-[10px] font-mono text-zinc-600 bg-zinc-900/60 p-3 rounded-lg overflow-x-auto max-h-24 overflow-y-auto">
                                {DOC_TOPIC_JSON_SCHEMA}
                            </pre>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder="Paste your doc topic JSON here..."
                                className={`w-full h-48 bg-zinc-900 text-zinc-300 border rounded-lg px-3 py-3 text-sm font-mono whitespace-pre outline-none focus:border-blue-500 resize-y ${jsonError ? "border-red-500" : "border-zinc-800"}`}
                            />
                            {jsonError ? (
                                <div className="flex items-center gap-2 text-xs text-red-400">
                                    <AlertCircle size={14} /> {jsonError}
                                </div>
                            ) : jsonInput.trim() ? (
                                <div className="flex items-center gap-2 text-xs text-emerald-400">
                                    <CheckCircle2 size={14} /> Valid JSON — preview updated
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Hub Selector */}
                    <div className="space-y-4 bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/60">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Doc Hub</h2>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Add topic to</label>
                            <select
                                value={selectedHubId}
                                onChange={(e) => setSelectedHubId(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            >
                                <option value="">Select a doc hub...</option>
                                {hubs.map((h) => (
                                    <option key={h._id} value={h._id}>{h.title}</option>
                                ))}
                            </select>
                            {hubs.length === 0 && (
                                <p className="text-xs text-zinc-500 mt-1">
                                    You can only add topics to hubs you author or contribute to.{" "}
                                    <Link href="/wizard/doc-hub" className="text-blue-400 hover:underline">Create a doc hub</Link> or request contributor access.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Metadata Section - hidden in JSON mode */}
                    {inputMode === "ui" && (
                    <div className="space-y-4 bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/60">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">Page Settings</h2>
                        {saveError && <p className="text-xs text-red-400">{saveError}</p>}
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
                    )}

                    {/* Blocks List - hidden in JSON mode */}
                    {inputMode === "ui" && (
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
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm font-mono min-h-[60px] outline-none focus:border-blue-500"
                                        placeholder={`Enter ${block.type} text...`}
                                    />
                                )}

                                {block.type === 'callout' && (
                                    <div className="space-y-2">
                                        <select value={block.variant} onChange={e => updateBlock(i, { variant: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm outline-none">
                                            <option value="info">Info (Blue)</option>
                                            <option value="warning">Warning (Orange)</option>
                                            <option value="tip">Tip (Green)</option>
                                            <option value="important">Important (Purple)</option>
                                        </select>
                                        <textarea value={block.text} onChange={e => updateBlock(i, { text: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm outline-none" rows={2} />
                                    </div>
                                )}

                                {block.type === 'code' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-zinc-500">Language:</span>
                                            <select value={block.lang} onChange={e => updateBlock(i, { lang: e.target.value })} className="w-48 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500">
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
                                        <textarea value={block.code} onChange={e => updateBlock(i, { code: e.target.value })} className="w-full bg-zinc-900 text-zinc-300 border border-zinc-800 rounded px-3 py-3 text-sm font-mono whitespace-pre outline-none focus:border-blue-500" rows={5} />
                                    </div>
                                )}

                                {block.type === 'list' && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500">Items (one per line):</label>
                                        <textarea
                                            value={block.items.join("\n")}
                                            onChange={e => updateBlock(i, { items: e.target.value.split("\n") })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
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
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm font-mono whitespace-pre outline-none focus:border-blue-500"
                                            rows={6}
                                        />
                                    </div>
                                )}

                                {block.type === 'comparison' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <input value={block.left.label} onChange={e => updateBlock(i, { left: { ...block.left, label: e.target.value } })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-bold text-red-400 mb-2" />
                                            <textarea value={block.left.items.join("\n")} onChange={e => updateBlock(i, { left: { ...block.left, items: e.target.value.split("\n") } })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2 text-xs h-24" />
                                        </div>
                                        <div>
                                            <input value={block.right.label} onChange={e => updateBlock(i, { right: { ...block.right, label: e.target.value } })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-bold text-emerald-400 mb-2" />
                                            <textarea value={block.right.items.join("\n")} onChange={e => updateBlock(i, { right: { ...block.right, items: e.target.value.split("\n") } })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2 text-xs h-24" />
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
                    )}
                </div>

                {/* Right Panel: Live Preview */}
                <div className={`w-full lg:w-1/2 lg:block bg-zinc-950 overflow-y-auto ${mobileTab === 'preview' ? 'block' : 'hidden'}`}>
                    <DocSection title={title} subtitle={subtitle} accent={accent} blocks={blocks} />
                </div>
            </div>
        </div>
    );
}
