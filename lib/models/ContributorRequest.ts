import mongoose from "mongoose";

export interface IContributorRequest {
  _id: mongoose.Types.ObjectId;
  hubId: mongoose.Types.ObjectId;
  hubType: "doc" | "exercise" | "cheatsheet";
  userId: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ContributorRequestSchema = new mongoose.Schema<IContributorRequest>(
  {
    hubId: { type: mongoose.Schema.Types.ObjectId, required: true },
    hubType: { type: String, enum: ["doc", "exercise", "cheatsheet"], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

ContributorRequestSchema.index({ hubId: 1, hubType: 1, userId: 1 }, { unique: true });

export default mongoose.models.ContributorRequest ||
  mongoose.model<IContributorRequest>("ContributorRequest", ContributorRequestSchema);
