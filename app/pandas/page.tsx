"use client";

import ExerciseBank from "@/app/components/ExerciseBank";
import { sections } from "@/data/pandas";

const tagColors: Record<string, string> = {};
let idCounter = 1;
const exercises: any[] = [];

sections.forEach((sec: any) => {
    const cleanLabel = sec.label.replace(/^\d+\s*—\s*/, '');
    tagColors[cleanLabel] = sec.color;

    sec.snippets.forEach((snippet: any) => {
        exercises.push({
            id: idCounter++,
            tag: cleanLabel,
            q: snippet.title,
            a: snippet.code,
            lang: snippet.lang || "python"
        });
    });
});

export default function PandasPage() {
    return (
        <div className="px-6 md:px-10 max-w-5xl mx-auto">
            <ExerciseBank
                title="Pandas Cheatsheet"
                description="Crucial Python Pandas snippets for grouping, transforming, cleaning, and visualizing data."
                exercises={exercises}
                tagColors={tagColors}
            />
        </div>
    );
}
