"use client";

import { useState } from "react";
import ExerciseBank, { Exercise } from "@/app/components/ExerciseBank";
import { Copy, Plus, Trash2, ArrowLeft, GripVertical } from "lucide-react";
import Link from "next/link";

export default function ExerciseWizard() {
    const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
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

    const generateCode = () => {
        const code = `import { Exercise } from "@/app/components/ExerciseBank";\n\nexport const exercises: Exercise[] = ${JSON.stringify(exercises, null, 4).replace(/"(id|tag|q|a|lang)":/g, "$1:")};`;
        navigator.clipboard.writeText(code);
        alert("TypeScript code copied to clipboard!");
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
        <div className="flex flex-col h-screen bg-black text-zinc-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-900 bg-zinc-950 shrink-0 gap-2">
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <Link href="/wizard" className="text-zinc-500 hover:text-zinc-200"><ArrowLeft size={18} /></Link>
                    <h1 className="font-semibold text-zinc-100 text-sm md:text-base truncate max-w-[150px] sm:max-w-none">Exercise Wizard</h1>
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
                <div className={`w-full lg:w-1/2 lg:flex flex-col border-r border-zinc-900 bg-zinc-950 overflow-y-auto p-4 md:p-6 space-y-6 ${mobileTab === 'editor' ? 'flex' : 'hidden'}`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Exercise Array ({exercises.length})</h2>
                        <button onClick={addExercise} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium">
                            <Plus size={14} /> Add new exercise
                        </button>
                    </div>

                    {exercises.map((ex, i) => (
                        <div key={ex.id} className="relative bg-zinc-900/40 border border-zinc-800 rounded-lg p-5 group flex gap-4">
                            <div className="flex flex-col items-center gap-2 pt-1 text-zinc-600">
                                <span className="text-[10px] font-mono leading-none">#{ex.id}</span>
                                <button onClick={() => removeEx(i)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Tag</label>
                                        <input
                                            value={ex.tag}
                                            onChange={e => updateEx(i, { tag: e.target.value })}
                                            placeholder="e.g. Pandas"
                                            className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Language (answer code)</label>
                                        <input
                                            value={ex.lang || ""}
                                            onChange={e => updateEx(i, { lang: e.target.value })}
                                            placeholder="e.g. python, sql, text"
                                            className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-blue-500 outline-none font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-2">
                                        Question
                                    </label>
                                    <textarea
                                        value={ex.q}
                                        onChange={e => updateEx(i, { q: e.target.value })}
                                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm max-h-40 focus:border-blue-500 outline-none"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Answer (Code or explanation)</label>
                                    <textarea
                                        value={ex.a}
                                        onChange={e => updateEx(i, { a: e.target.value })}
                                        className="w-full bg-[#0d0d10] text-[#d4d4d4] border border-zinc-800 rounded px-3 py-3 text-sm font-mono whitespace-pre outline-none focus:border-emerald-500 h-32"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addExercise}
                        className="w-full py-4 border border-dashed border-zinc-800 rounded-lg text-zinc-500 hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <Plus size={16} /> Add Exercise {exercises.length + 1}
                    </button>
                    <div className="h-20" /> {/* Spacer */}
                </div>

                {/* Right Panel: Live Preview */}
                <div className={`w-full lg:w-1/2 lg:block bg-[#050505] overflow-y-auto px-4 md:px-10 ${mobileTab === 'preview' ? 'block' : 'hidden'}`}>
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
