import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Star from "@/lib/models/Star";
import DocHub from "@/lib/models/DocHub";
import ExerciseHub from "@/lib/models/ExerciseHub";
import CheatsheetHub from "@/lib/models/CheatsheetHub";
import mongoose from "mongoose";

/** GET ?userId=xxx - returns starred hubs for user, with hub details */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Valid userId required" }, { status: 400 });
    }

    await connectDB();
    const stars = await Star.find({ userId }).sort({ createdAt: -1 }).lean();

    const docIds: mongoose.Types.ObjectId[] = [];
    const exIds: mongoose.Types.ObjectId[] = [];
    const csIds: mongoose.Types.ObjectId[] = [];

    for (const s of stars) {
      if (s.targetType === "docHub") docIds.push(s.targetId);
      else if (s.targetType === "exerciseHub") exIds.push(s.targetId);
      else if (s.targetType === "cheatsheetHub") csIds.push(s.targetId);
    }

    const [docHubs, exHubs, csHubs] = await Promise.all([
      DocHub.find({ _id: { $in: docIds } }).populate("authorId", "name").lean(),
      ExerciseHub.find({ _id: { $in: exIds } }).populate("authorId", "name").lean(),
      CheatsheetHub.find({ _id: { $in: csIds } }).populate("authorId", "name").lean(),
    ]);

    const order = stars.map((s) => ({
      type: s.targetType,
      id: s.targetId.toString(),
    }));

    const docMap = new Map(docHubs.map((h) => [h._id.toString(), { ...h, _type: "doc" }]));
    const exMap = new Map(exHubs.map((h) => [h._id.toString(), { ...h, _type: "exercise" }]));
    const csMap = new Map(csHubs.map((h) => [h._id.toString(), { ...h, _type: "cheatsheet" }]));

    const starred = order
      .map(({ type, id }) => {
        const map = type === "docHub" ? docMap : type === "exerciseHub" ? exMap : csMap;
        return map.get(id);
      })
      .filter(Boolean);

    return NextResponse.json(starred);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch starred" }, { status: 500 });
  }
}
