import mongoose from "mongoose";

export interface IStar {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  targetType: "docHub" | "exerciseHub" | "cheatsheetHub";
  targetId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StarSchema = new mongoose.Schema<IStar>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["docHub", "exerciseHub", "cheatsheetHub"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

StarSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
StarSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.models.Star || mongoose.model<IStar>("Star", StarSchema);
