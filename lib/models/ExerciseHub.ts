import mongoose from "mongoose";

export interface IExerciseHub {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  authorId: mongoose.Types.ObjectId;
  contributors: mongoose.Types.ObjectId[];
  forkedFrom?: mongoose.Types.ObjectId;
  forkedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseHubSchema = new mongoose.Schema<IExerciseHub>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contributors: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    forkedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "ExerciseHub" },
    forkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.ExerciseHub || mongoose.model<IExerciseHub>("ExerciseHub", ExerciseHubSchema);
