import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CheatsheetSection from "@/lib/models/CheatsheetSection";
import CheatsheetHub from "@/lib/models/CheatsheetHub";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { hubId, label, color, snippets } = body;
    if (!hubId || !label) {
      return NextResponse.json({ error: "hubId and label are required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(hubId)) {
      return NextResponse.json({ error: "Invalid hubId" }, { status: 400 });
    }
    const hub = await CheatsheetHub.findById(hubId);
    if (!hub) return NextResponse.json({ error: "Cheatsheet hub not found" }, { status: 404 });
    const contributorIds = hub.contributors?.map((c: { toString: () => string }) => c.toString()) ?? [];
    const { canEditResource } = await import("@/lib/can-edit");
    if (!canEditResource(session, hub.authorId, contributorIds)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const count = await CheatsheetSection.countDocuments({ hubId });
    const section = await CheatsheetSection.create({
      hubId,
      label,
      color: color || "#3b82f6",
      snippets: snippets || [],
      order: count,
      authorId: session.user.id,
    });
    return NextResponse.json(section);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create cheatsheet section" }, { status: 500 });
  }
}
