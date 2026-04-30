import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import DocHub from "@/lib/models/DocHub";
import DocTopic from "@/lib/models/DocTopic";
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
    const sourceHub = await DocHub.findById(id);
    if (!sourceHub) return NextResponse.json({ error: "Doc hub not found" }, { status: 404 });

    const newHub = await DocHub.create({
      title: customTitle || sourceHub.title,
      description: sourceHub.description || "",
      accent: sourceHub.accent || "#3b82f6",
      authorId: session.user.id,
      contributors: [],
      forkedFrom: sourceHub._id,
      forkedBy: session.user.id,
    });

    const topics = await DocTopic.find({ hubId: id }).sort({ order: 1 }).lean();
    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      await DocTopic.create({
        hubId: newHub._id,
        title: t.title,
        subtitle: t.subtitle,
        accent: t.accent || "#3b82f6",
        blocks: t.blocks || [],
        order: i,
        authorId: session.user.id,
        contributorIds: [],
      });
    }

    return NextResponse.json({
      id: newHub._id.toString(),
      title: newHub.title,
      href: `/docs/${newHub._id}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fork" }, { status: 500 });
  }
}
