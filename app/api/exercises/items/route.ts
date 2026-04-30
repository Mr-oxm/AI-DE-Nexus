import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Exercise from "@/lib/models/Exercise";
import ExerciseHub from "@/lib/models/ExerciseHub";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { hubId, tag, q, a, lang } = body;
    if (!hubId || !tag || !q || !a) {
      return NextResponse.json({ error: "hubId, tag, q, and a are required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(hubId)) {
      return NextResponse.json({ error: "Invalid hubId" }, { status: 400 });
    }
    const hub = await ExerciseHub.findById(hubId);
    if (!hub) return NextResponse.json({ error: "Exercise hub not found" }, { status: 404 });
    const contributorIds = hub.contributors?.map((c: { toString: () => string }) => c.toString()) ?? [];
    const { canEditResource } = await import("@/lib/can-edit");
    if (!canEditResource(session, hub.authorId, contributorIds)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const count = await Exercise.countDocuments({ hubId });
    const exercise = await Exercise.create({
      hubId,
      tag,
      q,
      a,
      lang: lang || "text",
      order: count,
      authorId: session.user.id,
    });
    return NextResponse.json(exercise);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
  }
}
