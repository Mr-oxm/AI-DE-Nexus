"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExerciseBank, { Exercise } from "@/app/components/ExerciseBank";
import { Copy, Plus, Trash2, ArrowLeft, Save, FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

type ExerciseHub = { _id: string; title: string };

const LANG_OPTIONS = ["text", "python", "sql", "javascript", "typescript", "bash", "json", "yaml", "html", "css"];

const EXERCISE_JSON_SCHEMA = `[
  { "id": 1, "tag": "string", "q": "question", "a": "answer", "lang": "python|sql|text (optional)" }
]`;

const EXERCISE_JSON_EXAMPLE = `[
  { "id": 1, "tag": "Pandas", "q": "How do you select rows where a column equals a value?", "a": "df[df['col'] == value]", "lang": "python" },
  { "id": 2, "tag": "SQL", "q": "Write a query to get distinct values?", "a": "SELECT DISTINCT col FROM table;", "lang": "sql" }
]`;

function parseExerciseJson(jsonStr: string): { ok: true; data: Exercise[] } | { ok: false; error: string } {
    try {
        const parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed)) {
            return { ok: false, error: "JSON must be an array of exercises" };
        }
        const validated: Exercise[] = [];
        for (let i = 0; i < parsed.length; i++) {
            const ex = parsed[i];
            if (!ex || typeof ex !== "object") {
                return { ok: false, error: `exercises[${i}]: must be an object` };
            }
            const tag = ex.tag;
            const q = ex.q;
            const a = ex.a;
            if (typeof tag !== "string" || !tag.trim()) {
                return { ok: false, error: `exercises[${i}]: tag (string) is required` };
            }
            if (typeof q !== "string" || !q.trim()) {
                return { ok: false, error: `exercises[${i}]: q (question) is required` };
            }
            if (typeof a !== "string" || !a.trim()) {
                return { ok: false, error: `exercises[${i}]: a (answer) is required` };
            }
            const id = typeof ex.id === "number" ? ex.id : i + 1;
            validated.push({
                id,
                tag: tag.trim(),
                q: q.trim(),
                a: a.trim(),
                lang: typeof ex.lang === "string" ? ex.lang : "text",
            });
        }
        return { ok: true, data: validated };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
}

export default function ExerciseWizard() {
    const [hubs, setHubs] = useState<ExerciseHub[]>([]);
    const [selectedHubId, setSelectedHubId] = useState("");
    const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [inputMode, setInputMode] = useState<"ui" | "json">("ui");
    const [jsonInput, setJsonInput] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const editExerciseId = searchParams.get("editExerciseId");
    const hubIdParam = searchParams.get("hubId");

    useEffect(() => {
        if (editExerciseId) {
            fetch(`/api/exercises/items/${editExerciseId}`)
                .then((r) => r.json())
                .then((ex) => {
                    if (ex && !ex.error) {
                        setExercises([{
                            id: 1,
                            tag: ex.tag || "",
                            q: ex.q || "",
                            a: ex.a || "",
                            lang: ex.lang || "text",
                        }]);
                        if (ex.hubId) setSelectedHubId(String(ex.hubId));
                    }
                });
        }
    }, [editExerciseId]);

    useEffect(() => {
        if (inputMode !== "json" || !jsonInput.trim()) {
            setJsonError(null);
            return;
        }
        const result = parseExerciseJson(jsonInput);
        if (result.ok) {
            setExercises(result.data);
            setJsonError(null);
        } else {
            setJsonError(result.error);
        }
    }, [jsonInput, inputMode]);
    const [exercises, setExercises] = useState<Exercise[]>([{
        id: 1,
        tag: "General",
        q: "What is this tool for?",
        a: "This tool generates the array of exercises you need for the data source.",
        lang: "text"
    }]);

    const addExercise = () => {
        setExercises([
            ...exercises,
            {
                id: exercises.length > 0 ? Math.max(...exercises.map(e => e.id)) + 1 : 1,
                tag: "General",
                q: "",
                a: "",
                lang: "python"
            }
        ]);
    };

    const updateEx = (idx: number, updates: Partial<Exercise>) => {
        const newEx = [...exercises];
        newEx[idx] = { ...newEx[idx], ...updates };
        setExercises(newEx);
    };

    const removeEx = (idx: number) => {
        setExercises(exercises.filter((_, i) => i !== idx));
    };

    useEffect(() => {
        fetch("/api/exercises/hubs?editable=true")
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

    const generateCode = () => {
        const code = `import { Exercise } from "@/app/components/ExerciseBank";\n\nexport const exercises: Exercise[] = ${JSON.stringify(exercises, null, 4).replace(/"(id|tag|q|a|lang)":/g, "$1:")};`;
        navigator.clipboard.writeText(code);
        alert("TypeScript code copied to clipboard!");
    };

    const saveToDb = async () => {
        setSaveError("");
        if (!selectedHubId) {
            setSaveError("Select an exercise hub first");
            return;
        }
        const valid = exercises.filter((e) => e.tag?.trim() && e.q?.trim() && e.a?.trim());
        if (valid.length === 0) {
            setSaveError("Add at least one exercise with tag, question, and answer");
            return;
        }
        setSaving(true);
        try {
            if (editExerciseId) {
                const ex = valid[0];
                const res = await fetch(`/api/exercises/items/${editExerciseId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tag: ex.tag.trim(),
                        q: ex.q.trim(),
                        a: ex.a.trim(),
                        lang: ex.lang || "text",
                    }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to update");
                }
                router.push(`/exercises/${selectedHubId}`);
            } else {
                for (const ex of valid) {
                    const res = await fetch("/api/exercises/items", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            hubId: selectedHubId,
                            tag: ex.tag.trim(),
                            q: ex.q.trim(),
                            a: ex.a.trim(),
                            lang: ex.lang || "text",
                        }),
                    });
                    if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || "Failed to save");
                    }
                }
                router.push(`/exercises/${selectedHubId}`);
            }
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Something went wrong");
            setSaving(false);
        }
    };

    const deleteExercise = async () => {
        if (!editExerciseId || !confirm("Delete this exercise? This cannot be undone.")) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/exercises/items/${editExerciseId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                setSaveError(data.error || "Failed to delete");
                setSaving(false);
                return;
            }
            router.push(`/exercises/${selectedHubId}`);
        } catch {
            setSaveError("Something went wrong");
            setSaving(false);
        }
    };

    // Auto-derive a tag colors map for the preview
    const tagColors: Record<string, string> = {};
    const defaultPalette = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
    let cIdx = 0;
    for (const ex of exercises) {
        if (!tagColors[ex.tag]) {
            tagColors[ex.tag] = defaultPalette[cIdx % defaultPalette.length];
            cIdx++;
        }
    }

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-900 bg-zinc-950 shrink-0 gap-2">
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <Link href="/wizard" className="text-zinc-500 hover:text-zinc-200"><ArrowLeft size={18} /></Link>
                    <h1 className="font-semibold text-zinc-100 text-sm md:text-base truncate max-w-[150px] sm:max-w-none">Exercise Wizard</h1>
                </div>
                <div className="flex items-center gap-2">
                    {editExerciseId && (
                        <button
                            onClick={deleteExercise}
                            disabled={saving}
                            className="flex shrink-0 items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-900/60 hover:bg-red-800/80 text-red-300 border border-red-800/60 rounded-md text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                        </button>
                    )}
                    <button
                        onClick={saveToDb}
                        disabled={saving || !selectedHubId}
                        className="flex shrink-0 items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs md:text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <Save size={16} /> <span className="hidden sm:inline">{saving ? "Saving..." : editExerciseId ? "Update" : "Save to DB"}</span>
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
                <div className={`w-full lg:w-1/2 lg:flex flex-col border-r border-zinc-900 bg-zinc-950 overflow-y-auto p-4 md:p-6 space-y-6 ${mobileTab === 'editor' ? 'flex' : 'hidden'}`}>
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
                                setJsonInput(JSON.stringify(exercises, null, 2));
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
                                            navigator.clipboard.writeText(EXERCISE_JSON_SCHEMA);
                                            alert("Schema copied!");
                                        }}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                                    >
                                        <Copy size={12} /> Schema
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(EXERCISE_JSON_EXAMPLE);
                                            alert("Example copied!");
                                        }}
                                        className="text-xs text-zinc-400 hover:text-zinc-300 font-medium flex items-center gap-1"
                                    >
                                        <Copy size={12} /> Example
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Paste an array of exercises. Preview updates when valid.
                            </p>
                            <pre className="text-[10px] font-mono text-zinc-600 bg-zinc-900/60 p-3 rounded-lg overflow-x-auto max-h-16 overflow-y-auto">
                                {EXERCISE_JSON_SCHEMA}
                            </pre>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder="Paste your exercises JSON array here..."
                                className={`w-full h-48 bg-zinc-900 text-zinc-300 border rounded-lg px-3 py-3 text-sm font-mono whitespace-pre outline-none focus:border-emerald-500 resize-y ${jsonError ? "border-red-500" : "border-zinc-800"}`}
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

                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Exercise Hub</label>
                        <select
                            value={selectedHubId}
                            onChange={(e) => setSelectedHubId(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                        >
                            <option value="">Select hub...</option>
                            {hubs.map((h) => (
                                <option key={h._id} value={h._id}>{h.title}</option>
                            ))}
                        </select>
                        {hubs.length === 0 && (
                            <p className="text-xs text-zinc-500 mt-1">
                                You can only add exercises to hubs you author or contribute to.{" "}
                                <Link href="/wizard/exercise-hub" className="text-emerald-400 hover:underline">Create an exercise hub</Link> or request contributor access.
                            </p>
                        )}
                        {saveError && <p className="text-xs text-red-400 mt-2">{saveError}</p>}
                    </div>
                    {inputMode === "ui" && (
                    <>
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">{editExerciseId ? "Edit Exercise" : `Exercise Array (${exercises.length})`}</h2>
                        {!editExerciseId && (
                        <button onClick={addExercise} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium">
                            <Plus size={14} /> Add new exercise
                        </button>
                        )}
                    </div>

                    {exercises.map((ex, i) => (
                        <div key={ex.id} className="relative bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 group flex gap-4">
                            <div className="flex flex-col items-center gap-2 pt-1 text-zinc-600">
                                <span className="text-[10px] font-mono leading-none">#{ex.id}</span>
                                {!editExerciseId && (
                                <button onClick={() => removeEx(i)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                </button>
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Tag</label>
                                        <input
                                            value={ex.tag}
                                            onChange={e => updateEx(i, { tag: e.target.value })}
                                            placeholder="e.g. Pandas"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Language</label>
                                        <select
                                            value={ex.lang || "text"}
                                            onChange={e => updateEx(i, { lang: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-emerald-500 outline-none"
                                        >
                                            {LANG_OPTIONS.map((l) => (
                                                <option key={l} value={l}>{l}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-2">
                                        Question
                                    </label>
                                    <textarea
                                        value={ex.q}
                                        onChange={e => updateEx(i, { q: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm max-h-40 focus:border-blue-500 outline-none"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Answer (Code or explanation)</label>
                                    <textarea
                                        value={ex.a}
                                        onChange={e => updateEx(i, { a: e.target.value })}
                                        className="w-full bg-zinc-900 text-zinc-300 border border-zinc-800 rounded px-3 py-3 text-sm font-mono whitespace-pre outline-none focus:border-emerald-500 h-32"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {!editExerciseId && (
                    <button
                        onClick={addExercise}
                        className="w-full py-4 border border-dashed border-zinc-800 rounded-lg text-zinc-500 hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <Plus size={16} /> Add Exercise {exercises.length + 1}
                    </button>
                    )}
                    <div className="h-20" /> {/* Spacer */}
                    </>
                    )}
                </div>

                {/* Right Panel: Live Preview */}
                <div className={`w-full lg:w-1/2 lg:block bg-zinc-950 overflow-y-auto px-4 md:px-10 ${mobileTab === 'preview' ? 'block' : 'hidden'}`}>
                    <ExerciseBank
                        title="Preview Environment"
                        description="Test your tags, questions, and formatting live."
                        tagColors={tagColors}
                        exercises={exercises}
                    />
                </div>
            </div>
        </div>
    );
}
