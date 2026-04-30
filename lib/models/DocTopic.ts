import mongoose from "mongoose";

export type DocBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "callout"; variant: "info" | "warning" | "tip" | "important"; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "comparison"; left: { label: string; items: string[] }; right: { label: string; items: string[] } }
  | { type: "divider" };

export interface IDocTopic {
  _id: mongoose.Types.ObjectId;
  hubId: mongoose.Types.ObjectId;
  title: string;
  subtitle?: string;
  accent: string;
  blocks: DocBlock[];
  order: number;
  authorId: mongoose.Types.ObjectId;
  contributorIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DocBlockSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    text: String,
    variant: String,
    lang: String,
    code: String,
    items: [String],
    headers: [String],
    rows: mongoose.Schema.Types.Mixed, // [[String]] - array of arrays
    left: { label: String, items: [String] },
    right: { label: String, items: [String] },
  },
  { _id: false }
);

const DocTopicSchema = new mongoose.Schema<IDocTopic>(
  {
    hubId: { type: mongoose.Schema.Types.ObjectId, ref: "DocHub", required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    accent: { type: String, default: "#3b82f6" },
    blocks: [DocBlockSchema],
    order: { type: Number, default: 0 },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contributorIds: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.DocTopic || mongoose.model<IDocTopic>("DocTopic", DocTopicSchema);
