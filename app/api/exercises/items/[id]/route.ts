import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Exercise from "@/lib/models/Exercise";
import ExerciseHub from "@/lib/models/ExerciseHub";
import { canEditResource } from "@/lib/can-edit";
import mongoose from "mongoose";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    await connectDB();
    const exercise = await Exercise.findById(id).lean();
    if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    return NextResponse.json(exercise);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch exercise" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const exercise = await Exercise.findById(id);
    if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    const hub = await ExerciseHub.findById(exercise.hubId);
    const contributorIds = hub?.contributors?.map((c: { toString: () => string }) => c.toString()) ?? [];
    if (!canEditResource(session, exercise.authorId, contributorIds)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { tag, q, a, lang } = body;
    if (tag) exercise.tag = tag;
    if (contributorIds.includes(session.user.id)) {
      const cids = exercise.contributorIds || [];
      if (!cids.some((c: { toString: () => string }) => c.toString() === session.user.id)) {
        cids.push(new mongoose.Types.ObjectId(session.user.id));
        exercise.contributorIds = cids;
      }
    }
    if (q) exercise.q = q;
    if (a) exercise.a = a;
    if (lang !== undefined) exercise.lang = lang;
    await exercise.save();
    return NextResponse.json(exercise);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const exercise = await Exercise.findById(id);
    if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    const hub = await ExerciseHub.findById(exercise.hubId);
    const contributorIds = hub?.contributors?.map((c: { toString: () => string }) => c.toString()) ?? [];
    if (!canEditResource(session, exercise.authorId, contributorIds)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await Exercise.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
  }
}
