import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ExerciseHub from "@/lib/models/ExerciseHub";
import Exercise from "@/lib/models/Exercise";
import mongoose from "mongoose";

export async function POST(
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

    let customTitle: string | undefined;
    try {
      const body = await req.json().catch(() => ({}));
      customTitle = typeof body?.title === "string" ? body.title.trim() : undefined;
    } catch {
      // no body or invalid JSON
    }

    await connectDB();
    const sourceHub = await ExerciseHub.findById(id);
    if (!sourceHub) return NextResponse.json({ error: "Exercise hub not found" }, { status: 404 });

    const newHub = await ExerciseHub.create({
      title: customTitle || sourceHub.title,
      description: sourceHub.description || "",
      authorId: session.user.id,
      contributors: [],
      forkedFrom: sourceHub._id,
      forkedBy: session.user.id,
    });

    const exercises = await Exercise.find({ hubId: id }).sort({ order: 1 }).lean();
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await Exercise.create({
        hubId: newHub._id,
        tag: ex.tag,
        q: ex.q,
        a: ex.a,
        lang: ex.lang || "text",
        order: i,
        authorId: session.user.id,
        contributorIds: [],
      });
    }

    return NextResponse.json({
      id: newHub._id.toString(),
      title: newHub.title,
      href: `/exercises/${newHub._id}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fork" }, { status: 500 });
  }
}
