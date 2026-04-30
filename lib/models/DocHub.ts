import mongoose from "mongoose";

export interface IDocHub {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  accent: string;
  authorId: mongoose.Types.ObjectId;
  contributors: mongoose.Types.ObjectId[];
  forkedFrom?: mongoose.Types.ObjectId;
  forkedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocHubSchema = new mongoose.Schema<IDocHub>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    accent: { type: String, default: "#3b82f6" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contributors: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    forkedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "DocHub" },
    forkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.DocHub || mongoose.model<IDocHub>("DocHub", DocHubSchema);
