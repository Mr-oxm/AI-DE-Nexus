"use client";

import ExerciseBank from "@/app/components/ExerciseBank";
import { exercises, tagColors } from "@/data/pandas_exercises";
import { Download } from "lucide-react";

const DownloadButton = () => (
    <a
        href="/api/download"
        download="pandas_practice.csv"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all duration-150"
    >
        <Download size={14} />
        pandas_practice.csv
    </a>
);

export default function PandasPracticePage() {
    return (
        <div className="px-6 md:px-10 max-w-5xl mx-auto">
            <ExerciseBank
                title="Pandas Exercises"
                description="Hands-on DataFrame practice with the provided CSV — cleaning, grouping, windows, and more."
                exercises={exercises}
                tagColors={tagColors}
                headerSlot={<DownloadButton />}
            />
        </div>
    );
}
