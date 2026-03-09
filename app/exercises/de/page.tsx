"use client";

import ExerciseBank from "@/app/components/ExerciseBank";
import { exercises, tagColors } from "@/data/de_exercises";

export default function DEExercisesPage() {
    return (
        <div className="px-6 md:px-10 max-w-5xl mx-auto">
            <ExerciseBank
                title="Data Engineering Exercises"
                description="Comprehensive interview questions and answers for Data Engineering concepts."
                exercises={exercises}
                tagColors={tagColors}
            />
        </div>
    );
}
