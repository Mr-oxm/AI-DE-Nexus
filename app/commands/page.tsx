"use client";

import ExerciseBank from "@/app/components/ExerciseBank";
import { categories, commands } from "@/data/de_commands";

const tagColors: Record<string, string> = {
    "navigation": "#10b981",
    "files": "#f59e0b",
    "compression": "#f97316",
    "text": "#8b5cf6",
    "permissions": "#06b6d4",
    "process": "#ef4444",
    "network": "#e07030",
    "data": "#22d3ee",
    "windows": "#fb923c",
};

let idCounter = 1;
const exercises: any[] = [];

commands.forEach((cmd: any) => {
    exercises.push({
        id: idCounter++,
        tag: cmd.cat,
        q: `[${cmd.os === 'linux' ? 'Linux' : 'Windows'}] ${cmd.desc}`,
        a: cmd.cmd,
        lang: cmd.os === 'linux' ? 'bash' : 'powershell'
    });
});

export default function CommandsPage() {
    return (
        <div className="px-6 md:px-10 max-w-5xl mx-auto">
            <ExerciseBank
                title="DE Commands Cheatsheet"
                description="Essential terminal commands for Linux and Windows tailored for Data Engineers."
                exercises={exercises}
                tagColors={tagColors}
            />
        </div>
    );
}
