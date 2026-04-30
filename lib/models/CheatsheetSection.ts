import mongoose from "mongoose";

export interface ICheatsheetSection {
  _id: mongoose.Types.ObjectId;
  hubId: mongoose.Types.ObjectId;
  label: string;
  color: string;
  snippets: { title: string; code: string; lang: string }[];
  order: number;
  authorId: mongoose.Types.ObjectId;
  contributorIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SnippetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },
    lang: { type: String, default: "python" },
  },
  { _id: false }
);

const CheatsheetSectionSchema = new mongoose.Schema<ICheatsheetSection>(
  {
    hubId: { type: mongoose.Schema.Types.ObjectId, ref: "CheatsheetHub", required: true },
    label: { type: String, required: true },
    color: { type: String, default: "#3b82f6" },
    snippets: [SnippetSchema],
    order: { type: Number, default: 0 },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contributorIds: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.CheatsheetSection || mongoose.model<ICheatsheetSection>("CheatsheetSection", CheatsheetSectionSchema);
