import Link from "next/link";
import { ArrowRight, Wand2, FileCode2, Dumbbell } from "lucide-react";

export default function WizardIndexPage() {
    return (
        <div className="px-6 md:px-10 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="mb-10 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Creator Studio</p>
                <h1 className="flex items-center gap-3 text-3xl font-bold text-zinc-50 tracking-tight">
                    <Wand2 className="text-emerald-500" /> Content Wizards
                </h1>
                <p className="text-sm text-zinc-500 max-w-xl leading-relaxed">
                    Visual builders to quickly generate the TypeScript code for new documentation pages and exercise banks.
                </p>
            </div>

            <div className="border-t border-zinc-800 mb-8" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                    href="/wizard/doc"
                    className="group flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
                >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <FileCode2 size={18} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <p className="font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">Doc Page Wizard</p>
                            <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Visually build a new documentation page with headings, paragraphs, code blocks, tables, and callouts. Real-time preview included.
                        </p>
                    </div>
                </Link>

                <Link
                    href="/wizard/exercise"
                    className="group flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
                >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Dumbbell size={18} className="text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <p className="font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">Exercise Wizard</p>
                            <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Easily batch-create exercises (Question, Answer, Tag, Language) and export the list to drop into a data file.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
