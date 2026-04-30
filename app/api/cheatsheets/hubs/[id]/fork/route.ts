import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CheatsheetHub from "@/lib/models/CheatsheetHub";
import CheatsheetSection from "@/lib/models/CheatsheetSection";
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
    const sourceHub = await CheatsheetHub.findById(id);
    if (!sourceHub) return NextResponse.json({ error: "Cheatsheet hub not found" }, { status: 404 });

    const newHub = await CheatsheetHub.create({
      title: customTitle || sourceHub.title,
      description: sourceHub.description || "",
      authorId: session.user.id,
      contributors: [],
      forkedFrom: sourceHub._id,
      forkedBy: session.user.id,
    });

    const sections = await CheatsheetSection.find({ hubId: id }).sort({ order: 1 }).lean();
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      await CheatsheetSection.create({
        hubId: newHub._id,
        label: sec.label,
        color: sec.color || "#3b82f6",
        snippets: sec.snippets || [],
        order: i,
        authorId: session.user.id,
        contributorIds: [],
      });
    }

    return NextResponse.json({
      id: newHub._id.toString(),
      title: newHub.title,
      href: `/cheatsheets/${newHub._id}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fork" }, { status: 500 });
  }
}
