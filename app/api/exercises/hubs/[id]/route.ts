import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ExerciseHub from "@/lib/models/ExerciseHub";
import Exercise from "@/lib/models/Exercise";
import Star from "@/lib/models/Star";

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
    const session = await getServerSession(authOptions);
    const hub = await ExerciseHub.findById(id)
      .populate("authorId", "name")
      .populate("forkedFrom", "title")
      .lean();
    if (!hub) return NextResponse.json({ error: "Exercise hub not found" }, { status: 404 });
    const exercises = await Exercise.find({ hubId: id }).sort({ order: 1 }).lean();
    const [starCount, starred] = await Promise.all([
      Star.countDocuments({ targetType: "exerciseHub", targetId: id }),
      session?.user?.id
        ? Star.exists({ userId: session.user.id, targetType: "exerciseHub", targetId: id })
        : false,
    ]);
    return NextResponse.json({
      ...hub,
      exercises,
      starCount,
      starred: !!starred,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch exercise hub" }, { status: 500 });
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
    const hub = await ExerciseHub.findById(id);
    if (!hub) return NextResponse.json({ error: "Exercise hub not found" }, { status: 404 });
    if (hub.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { title, description } = body;
    if (title) hub.title = title;
    if (description !== undefined) hub.description = description;
    await hub.save();
    return NextResponse.json(hub);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update exercise hub" }, { status: 500 });
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
    const hub = await ExerciseHub.findById(id);
    if (!hub) return NextResponse.json({ error: "Exercise hub not found" }, { status: 404 });
    if (hub.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await Exercise.deleteMany({ hubId: id });
    await ExerciseHub.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete exercise hub" }, { status: 500 });
  }
}
