"use client";

import ExerciseBank from "@/app/components/ExerciseBank";
import { exercises, tagColors } from "@/data/spark_exercises";

export default function SparkExercisesPage() {
    return (
        <div className="px-6 md:px-10 max-w-5xl mx-auto">
            <ExerciseBank
                title="PySpark Exercises"
                description="Master PySpark with these hands-on interview questions."
                exercises={exercises}
                tagColors={tagColors}
            />
        </div>
    );
}
