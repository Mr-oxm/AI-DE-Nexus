import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import DocTopic from "@/lib/models/DocTopic";
import DocHub from "@/lib/models/DocHub";
import mongoose from "mongoose";
import { canEditResource } from "@/lib/can-edit";
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
    const topic = await DocTopic.findById(id)
      .populate("authorId", "name")
      .populate("contributorIds", "name")
      .lean();
    if (!topic) return NextResponse.json({ error: "Doc topic not found" }, { status: 404 });
    return NextResponse.json(topic);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch doc topic" }, { status: 500 });
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
    const topic = await DocTopic.findById(id);
    if (!topic) return NextResponse.json({ error: "Doc topic not found" }, { status: 404 });
    const hub = await DocHub.findById(topic.hubId);
    const contributorIds = hub?.contributors?.map((c: { toString: () => string }) => c.toString()) ?? [];
    if (!canEditResource(session, topic.authorId, contributorIds)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { title, subtitle, accent, blocks } = body;
    if (title) topic.title = title;
    if (contributorIds.includes(session.user.id)) {
      const cids = topic.contributorIds || [];
      if (!cids.some((c: { toString: () => string }) => c.toString() === session.user.id)) {
        cids.push(new mongoose.Types.ObjectId(session.user.id));
        topic.contributorIds = cids;
      }
    }
    if (subtitle !== undefined) topic.subtitle = subtitle;
    if (accent) topic.accent = accent;
    if (blocks) topic.blocks = blocks;
    await topic.save();
    return NextResponse.json(topic);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update doc topic" }, { status: 500 });
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
    const topic = await DocTopic.findById(id);
    if (!topic) return NextResponse.json({ error: "Doc topic not found" }, { status: 404 });
    const hub = await DocHub.findById(topic.hubId);
    const contributorIds = hub?.contributors?.map((c: { toString: () => string }) => c.toString()) ?? [];
    if (!canEditResource(session, topic.authorId, contributorIds)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await DocTopic.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete doc topic" }, { status: 500 });
  }
}
