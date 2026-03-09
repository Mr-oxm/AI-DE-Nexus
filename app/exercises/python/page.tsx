"use client";

import ExerciseBank from "@/app/components/ExerciseBank";
import { exercises, tagColors } from "@/data/python_exercises";

export default function PythonExercisesPage() {
    return (
        <div className="px-6 md:px-10 max-w-5xl mx-auto">
            <ExerciseBank
                title="Python Exercises"
                description="Practice your Python skills with these focused exercises."
                exercises={exercises}
                tagColors={tagColors}
            />
        </div>
    );
}
