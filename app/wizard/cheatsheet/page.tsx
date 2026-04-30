"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExerciseBank from "@/app/components/ExerciseBank";
import { Copy, ArrowLeft, Save, FileJson, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type CheatsheetHub = { _id: string; title: string };

type Snippet = { id: number; tag: string; title: string; code: string; lang: string };
type Section = { label: string; color: string; snippets: { title: string; code: string; lang: string }[] };

const LANG_OPTIONS = ["text", "python", "sql", "javascript", "typescript", "bash", "json", "yaml", "html", "css"];

const CHEATSHEET_JSON_SCHEMA = `[
  {
    "label": "Section name",
    "color": "#3b82f6 (optional)",
    "snippets": [
      { "title": "Snippet title", "code": "code here", "lang": "python|sql|text|..." }
    ]
  }
]`;

const CHEATSHEET_JSON_EXAMPLE = `[
  {
    "label": "DataFrames",
    "color": "#3b82f6",
    "snippets": [
      { "title": "Create from dict", "code": "df = pd.DataFrame({'a': [1,2], 'b': [3,4]})", "lang": "python" },
      { "title": "Select columns", "code": "df[['col1', 'col2']]", "lang": "python" }
    ]
  },
  {
    "label": "SQL Basics",
    "color": "#10b981",
    "snippets": [
      { "title": "Select", "code": "SELECT * FROM table;", "lang": "sql" }
    ]
  }
]`;

function parseCheatsheetJson(jsonStr: string): { ok: true; data: Section[] } | { ok: false; error: string } {
    try {
        const parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed)) {
            return { ok: false, error: "JSON must be an array of sections" };
        }
        const validated: Section[] = [];
        for (let i = 0; i < parsed.length; i++) {
            const sec = parsed[i];
            if (!sec || typeof sec !== "object") {
                return { ok: false, error: `sections[${i}]: must be an object` };
            }
            const label = sec.label;
            if (typeof label !== "string") {
                return { ok: false, error: `sections[${i}]: label must be a string` };
            }
            const snippets = sec.snippets;
            if (!Array.isArray(snippets)) {
                return { ok: false, error: `sections[${i}]: snippets must be an array` };
            }
            const validSnippets: { title: string; code: string; lang: string }[] = [];
            for (let j = 0; j < snippets.length; j++) {
                const sn = snippets[j];
                if (!sn || typeof sn !== "object") {
                    return { ok: false, error: `sections[${i}].snippets[${j}]: must be an object` };
                }
                const title = sn.title;
                const code = sn.code;
                if (typeof title !== "string") {
                    return { ok: false, error: `sections[${i}].snippets[${j}]: title must be a string` };
                }
                if (typeof code !== "string") {
                    return { ok: false, error: `sections[${i}].snippets[${j}]: code is required` };
                }
                validSnippets.push({
                    title: typeof title === "string" ? title : "",
                    code: String(code),
                    lang: typeof sn.lang === "string" ? sn.lang : "python",
                });
            }
            validated.push({
                label: typeof label === "string" ? label : "",
                color: typeof sec.color === "string" ? sec.color : "#3b82f6",
                snippets: validSnippets,
            });
        }
        return { ok: true, data: validated };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
}

function sectionsToSnippets(sections: Section[]): Snippet[] {
    const out: Snippet[] = [];
    let id = 1;
    for (const sec of sections) {
        const cleanLabel = sec.label.replace(/^\d+\s*—\s*/, "");
        for (const sn of sec.snippets) {
            out.push({
                id: id++,
                tag: cleanLabel,
                title: sn.title,
                code: sn.code,
                lang: sn.lang || "python",
            });
        }
    }
    return out;
}

function snippetsToSections(snippets: Snippet[]): Section[] {
    const defaultPalette = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
    const byTag = new Map<string, { color: string; snippets: { title: string; code: string; lang: string }[] }>();
    let cIdx = 0;
    for (const sn of snippets) {
        const tag = sn.tag.trim() || "General";
        if (!byTag.has(tag)) {
            byTag.set(tag, { color: defaultPalette[cIdx++ % defaultPalette.length], snippets: [] });
        }
        byTag.get(tag)!.snippets.push({ title: sn.title, code: sn.code, lang: sn.lang || "python" });
    }
    return Array.from(byTag.entries()).map(([label, { color, snippets }]) => ({ label, color, snippets }));
}

function snippetsToExercises(snippets: Snippet[]): { id: number; tag: string; q: string; a: string; lang: string }[] {
    return snippets.map((s) => ({ id: s.id, tag: s.tag, q: s.title, a: s.code, lang: s.lang }));
}

export default function CheatsheetWizardPage() {
    const [hubs, setHubs] = useState<CheatsheetHub[]>([]);
    const [selectedHubId, setSelectedHubId] = useState("");
    const [inputMode, setInputMode] = useState<"ui" | "json">("ui");
    const [jsonInput, setJsonInput] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [snippets, setSnippets] = useState<Snippet[]>([
        { id: 1, tag: "General", title: "", code: "", lang: "python" },
    ]);
    const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const editSectionId = searchParams.get("editSectionId");
    const hubIdParam = searchParams.get("hubId");

    useEffect(() => {
        if (editSectionId) {
            fetch(`/api/cheatsheets/sections/${editSectionId}`)
                .then((r) => r.json())
                .then((sec) => {
                    if (sec && !sec.error) {
                        const tag = sec.label || "";
                        const snips: Snippet[] = (sec.snippets || []).map((s: { title: string; code: string; lang?: string }, i: number) => ({
                            id: i + 1,
                            tag,
                            title: s.title || "",
                            code: s.code || "",
                            lang: s.lang || "python",
                        }));
                        setSnippets(snips.length > 0 ? snips : [{ id: 1, tag, title: "", code: "", lang: "python" }]);
                        if (sec.hubId) setSelectedHubId(String(sec.hubId));
                    }
                });
        }
    }, [editSectionId]);

    useEffect(() => {
        fetch("/api/cheatsheets/hubs?editable=true")
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

    useEffect(() => {
        if (inputMode !== "json" || !jsonInput.trim()) {
            setJsonError(null);
            return;
        }
        const result = parseCheatsheetJson(jsonInput);
        if (result.ok) {
            setSnippets(sectionsToSnippets(result.data));
            setJsonError(null);
        } else {
            setJsonError(result.error);
        }
    }, [jsonInput, inputMode]);

    const exercises = snippetsToExercises(snippets);
    const tagColors: Record<string, string> = {};
    const defaultPalette = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
    let cIdx = 0;
    for (const s of snippets) {
        const tag = s.tag || "General";
        if (!tagColors[tag]) tagColors[tag] = defaultPalette[cIdx++ % defaultPalette.length];
    }

    const addSnippet = () => {
        const nextId = snippets.length > 0 ? Math.max(...snippets.map((s) => s.id)) + 1 : 1;
        const lastTag = snippets.length > 0 ? snippets[snippets.length - 1].tag : "General";
        setSnippets([...snippets, { id: nextId, tag: lastTag, title: "", code: "", lang: "python" }]);
    };

    const removeSnippet = (idx: number) => {
        setSnippets(snippets.filter((_, i) => i !== idx));
    };

    const updateSnippet = (idx: number, updates: Partial<Snippet>) => {
        const next = [...snippets];
        next[idx] = { ...next[idx], ...updates };
        setSnippets(next);
    };

    const saveToDb = async () => {
        setSaveError("");
        if (!selectedHubId) {
            setSaveError("Select a cheatsheet hub first");
            return;
        }
        const sections = snippetsToSections(snippets);
        const validSections = sections.filter((s) => s.label.trim() && s.snippets.some((sn) => sn.title.trim() && sn.code.trim()));
        if (validSections.length === 0) {
            setSaveError("Add at least one snippet with tag, title, and code");
            return;
        }
        setSaving(true);
        try {
            if (editSectionId) {
                const sec = validSections[0];
                const res = await fetch(`/api/cheatsheets/sections/${editSectionId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        label: sec.label,
                        color: sec.color,
                        snippets: sec.snippets,
                    }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to update section");
                }
                router.push(`/cheatsheets/${selectedHubId}`);
            } else {
                for (const sec of validSections) {
                    const res = await fetch("/api/cheatsheets/sections", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            hubId: selectedHubId,
                            label: sec.label,
                            color: sec.color,
                            snippets: sec.snippets,
                        }),
                    });
                    if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || "Failed to save section");
                    }
                }
                router.push(`/cheatsheets/${selectedHubId}`);
            }
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Something went wrong");
            setSaving(false);
        }
    };

    const hasValidSnippets = snippets.some((s) => s.tag.trim() && s.title.trim() && s.code.trim());

    const deleteSection = async () => {
        if (!editSectionId || !confirm("Delete this section? This cannot be undone.")) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/cheatsheets/sections/${editSectionId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                setSaveError(data.error || "Failed to delete");
                setSaving(false);
                return;
            }
            router.push(`/cheatsheets/${selectedHubId}`);
        } catch {
            setSaveError("Something went wrong");
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-900 bg-zinc-950 shrink-0 gap-2">
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <Link href="/wizard" className="text-zinc-500 hover:text-zinc-200"><ArrowLeft size={18} /></Link>
                    <h1 className="font-semibold text-zinc-100 text-sm md:text-base truncate max-w-[150px] sm:max-w-none">Cheatsheet Wizard</h1>
                </div>
                <div className="flex items-center gap-2">
                    {editSectionId && (
                        <button
                            onClick={deleteSection}
                            disabled={saving}
                            className="flex shrink-0 items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-900/60 hover:bg-red-800/80 text-red-300 border border-red-800/60 rounded-md text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                        </button>
                    )}
                    <button
                    onClick={saveToDb}
                    disabled={saving || !selectedHubId || !hasValidSnippets}
                    className="flex shrink-0 items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
                >
                        <Save size={16} /> <span className="hidden sm:inline">{saving ? "Saving..." : editSectionId ? "Update" : "Save to DB"}</span>
                </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                <div className="flex lg:hidden bg-zinc-900 shrink-0 border-b border-zinc-800">
                    <button onClick={() => setMobileTab("editor")} className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mobileTab === "editor" ? "text-amber-400 border-b-2 border-amber-400 bg-zinc-900/50" : "text-zinc-500 hover:text-zinc-300"}`}>EDITOR</button>
                    <button onClick={() => setMobileTab("preview")} className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mobileTab === "preview" ? "text-amber-400 border-b-2 border-amber-400 bg-zinc-900/50" : "text-zinc-500 hover:text-zinc-300"}`}>LIVE PREVIEW</button>
                </div>

                <div className={`w-full lg:w-1/2 lg:flex flex-col border-r border-zinc-900 bg-zinc-950 overflow-y-auto p-4 md:p-6 space-y-6 ${mobileTab === "editor" ? "flex" : "hidden"}`}>
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
                                setJsonInput(JSON.stringify(snippetsToSections(snippets), null, 2));
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
                                    <button onClick={() => { navigator.clipboard.writeText(CHEATSHEET_JSON_SCHEMA); alert("Schema copied!"); }} className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
                                        <Copy size={12} /> Schema
                                    </button>
                                    <button onClick={() => { navigator.clipboard.writeText(CHEATSHEET_JSON_EXAMPLE); alert("Example copied!"); }} className="text-xs text-zinc-400 hover:text-zinc-300 font-medium flex items-center gap-1">
                                        <Copy size={12} /> Example
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">Paste an array of sections. Preview updates when valid.</p>
                            <pre className="text-[10px] font-mono text-zinc-600 bg-zinc-900/60 p-3 rounded-lg overflow-x-auto max-h-20 overflow-y-auto">{CHEATSHEET_JSON_SCHEMA}</pre>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder="Paste your cheatsheet sections JSON here..."
                                className={`w-full h-56 bg-zinc-900 text-zinc-300 border rounded-lg px-3 py-3 text-sm font-mono whitespace-pre outline-none focus:border-amber-500 resize-y ${jsonError ? "border-red-500" : "border-zinc-800"}`}
                            />
                            {jsonError ? (
                                <div className="flex items-center gap-2 text-xs text-red-400"><AlertCircle size={14} /> {jsonError}</div>
                            ) : jsonInput.trim() ? (
                                <div className="flex items-center gap-2 text-xs text-emerald-400"><CheckCircle2 size={14} /> Valid JSON — preview updated</div>
                            ) : null}
                        </div>
                    )}

                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Cheatsheet Hub</label>
                        <select
                            value={selectedHubId}
                            onChange={(e) => setSelectedHubId(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none"
                        >
                            <option value="">Select hub...</option>
                            {hubs.map((h) => (
                                <option key={h._id} value={h._id}>{h.title}</option>
                            ))}
                        </select>
                        {hubs.length === 0 && (
                            <p className="text-xs text-zinc-500 mt-1">
                                You can only add sections to hubs you author or contribute to.{" "}
                                <Link href="/wizard/cheatsheet-hub" className="text-amber-400 hover:underline">Create a cheatsheet hub</Link> or request contributor access.
                            </p>
                        )}
                        {saveError && <p className="text-xs text-red-400 mt-2">{saveError}</p>}
                    </div>

                    {inputMode === "ui" && (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Snippets ({snippets.length})</h2>
                                <button onClick={addSnippet} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium">
                                    <Plus size={14} /> Add snippet
                                </button>
                            </div>

                            {snippets.map((sn, i) => (
                                <div key={sn.id} className="relative bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 group flex gap-4">
                                    <div className="flex flex-col items-center gap-2 pt-1 text-zinc-600">
                                        <span className="text-[10px] font-mono leading-none">#{sn.id}</span>
                                        <button onClick={() => removeSnippet(i)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Tag (section)</label>
                                                <input
                                                    value={sn.tag}
                                                    onChange={(e) => updateSnippet(i, { tag: e.target.value })}
                                                    placeholder="e.g. DataFrames"
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-amber-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Language</label>
                                                <select
                                                    value={sn.lang || "python"}
                                                    onChange={(e) => updateSnippet(i, { lang: e.target.value })}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-amber-500 outline-none"
                                                >
                                                    {LANG_OPTIONS.map((l) => (
                                                        <option key={l} value={l}>{l}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Title</label>
                                            <input
                                                value={sn.title}
                                                onChange={(e) => updateSnippet(i, { title: e.target.value })}
                                                placeholder="Snippet title"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Code</label>
                                            <textarea
                                                value={sn.code}
                                                onChange={(e) => updateSnippet(i, { code: e.target.value })}
                                                className="w-full bg-zinc-900 text-zinc-300 border border-zinc-800 rounded px-3 py-3 text-sm font-mono whitespace-pre outline-none focus:border-amber-500 h-32"
                                                placeholder="Code snippet"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addSnippet}
                                className="w-full py-4 border border-dashed border-zinc-800 rounded-lg text-zinc-500 hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <Plus size={16} /> Add Snippet {snippets.length + 1}
                            </button>
                            <div className="h-20" />
                        </>
                    )}
                </div>

                <div className={`w-full lg:w-1/2 lg:block bg-zinc-950 overflow-y-auto px-4 md:px-10 ${mobileTab === "preview" ? "block" : "hidden"}`}>
                    <ExerciseBank
                        title="Preview"
                        description={`${snippets.length} snippet(s)`}
                        tagColors={tagColors}
                        exercises={exercises}
                    />
                </div>
            </div>
        </div>
    );
}
