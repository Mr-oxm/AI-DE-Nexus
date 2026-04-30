import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import DocHub from "@/lib/models/DocHub";
import DocTopic from "@/lib/models/DocTopic";
import Star from "@/lib/models/Star";
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
    const session = await getServerSession(authOptions);
    const hub = await DocHub.findById(id).populate("authorId", "name").populate("forkedFrom", "title").lean();
    if (!hub) return NextResponse.json({ error: "Doc hub not found" }, { status: 404 });
    const topics = await DocTopic.find({ hubId: id })
      .populate("authorId", "name")
      .sort({ order: 1 })
      .lean();
    const [starCount, starred] = await Promise.all([
      Star.countDocuments({ targetType: "docHub", targetId: id }),
      session?.user?.id
        ? Star.exists({ userId: session.user.id, targetType: "docHub", targetId: id })
        : false,
    ]);
    return NextResponse.json({
      ...hub,
      topics,
      starCount,
      starred: !!starred,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch doc hub" }, { status: 500 });
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
    const hub = await DocHub.findById(id);
    if (!hub) return NextResponse.json({ error: "Doc hub not found" }, { status: 404 });
    if (hub.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { title, description, accent } = body;
    if (title) hub.title = title;
    if (description !== undefined) hub.description = description;
    if (accent) hub.accent = accent;
    await hub.save();
    return NextResponse.json(hub);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update doc hub" }, { status: 500 });
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
    const hub = await DocHub.findById(id);
    if (!hub) return NextResponse.json({ error: "Doc hub not found" }, { status: 404 });
    if (hub.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await DocTopic.deleteMany({ hubId: id });
    await DocHub.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete doc hub" }, { status: 500 });
  }
}
