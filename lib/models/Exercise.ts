import mongoose from "mongoose";

export interface IExercise {
  _id: mongoose.Types.ObjectId;
  hubId: mongoose.Types.ObjectId;
  tag: string;
  q: string;
  a: string;
  lang?: string;
  order: number;
  authorId: mongoose.Types.ObjectId;
  contributorIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new mongoose.Schema<IExercise>(
  {
    hubId: { type: mongoose.Schema.Types.ObjectId, ref: "ExerciseHub", required: true },
    tag: { type: String, required: true },
    q: { type: String, required: true },
    a: { type: String, required: true },
    lang: { type: String, default: "text" },
    order: { type: Number, default: 0 },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contributorIds: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Exercise || mongoose.model<IExercise>("Exercise", ExerciseSchema);
