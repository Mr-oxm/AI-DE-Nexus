import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import DocTopic from "@/lib/models/DocTopic";
import DocHub from "@/lib/models/DocHub";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { hubId, title, subtitle, accent, blocks } = body;
    if (!hubId || !title) {
      return NextResponse.json({ error: "hubId and title are required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(hubId)) {
      return NextResponse.json({ error: "Invalid hubId" }, { status: 400 });
    }
    const hub = await DocHub.findById(hubId);
    if (!hub) return NextResponse.json({ error: "Doc hub not found" }, { status: 404 });
    const contributorIds = hub.contributors?.map((c: { toString: () => string }) => c.toString()) ?? [];
    const { canEditResource } = await import("@/lib/can-edit");
    if (!canEditResource(session, hub.authorId, contributorIds)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const count = await DocTopic.countDocuments({ hubId });
    const topic = await DocTopic.create({
      hubId,
      title,
      subtitle: subtitle || "",
      accent: accent || "#3b82f6",
      blocks: blocks || [],
      order: count,
      authorId: session.user.id,
    });
    return NextResponse.json(topic);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create doc topic" }, { status: 500 });
  }
}
