import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CheatsheetSection from "@/lib/models/CheatsheetSection";
import CheatsheetHub from "@/lib/models/CheatsheetHub";
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
    const section = await CheatsheetSection.findById(id).lean();
    if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });
    return NextResponse.json(section);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch section" }, { status: 500 });
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
    const section = await CheatsheetSection.findById(id);
    if (!section) return NextResponse.json({ error: "Cheatsheet section not found" }, { status: 404 });
    const hub = await CheatsheetHub.findById(section.hubId);
    const contributorIds = hub?.contributors?.map((c: { toString: () => string }) => c.toString()) ?? [];
    if (!canEditResource(session, section.authorId, contributorIds)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { label, color, snippets } = body;
    if (label) section.label = label;
    if (contributorIds.includes(session.user.id)) {
      const cids = section.contributorIds || [];
      if (!cids.some((c: { toString: () => string }) => c.toString() === session.user.id)) {
        cids.push(new mongoose.Types.ObjectId(session.user.id));
        section.contributorIds = cids;
      }
    }
    if (color) section.color = color;
    if (snippets) section.snippets = snippets;
    await section.save();
    return NextResponse.json(section);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update cheatsheet section" }, { status: 500 });
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
    const section = await CheatsheetSection.findById(id);
    if (!section) return NextResponse.json({ error: "Cheatsheet section not found" }, { status: 404 });
    const hub = await CheatsheetHub.findById(section.hubId);
    const contributorIds = hub?.contributors?.map((c: { toString: () => string }) => c.toString()) ?? [];
    if (!canEditResource(session, section.authorId, contributorIds)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await CheatsheetSection.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete cheatsheet section" }, { status: 500 });
  }
}
