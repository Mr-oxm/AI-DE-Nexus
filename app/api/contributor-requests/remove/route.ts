import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import DocHub from "@/lib/models/DocHub";
import ExerciseHub from "@/lib/models/ExerciseHub";
import CheatsheetHub from "@/lib/models/CheatsheetHub";
import mongoose from "mongoose";

const HUB_MODELS = {
  doc: DocHub,
  exercise: ExerciseHub,
  cheatsheet: CheatsheetHub,
} as const;

/** POST body: { hubId, hubType, userId } - remove contributor from hub. Author or admin only. */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { hubId, hubType, userId } = body;
    if (!hubId || !hubType || !userId) {
      return NextResponse.json({ error: "hubId, hubType, userId required" }, { status: 400 });
    }

    await connectDB();
    const Hub = HUB_MODELS[hubType as keyof typeof HUB_MODELS];
    const hub = await Hub.findById(hubId);
    if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

    const role = (session.user as { role?: string }).role;
    const isAuthor = hub.authorId.toString() === session.user.id;
    if (!isAuthor && role !== "admin" && role !== "superadmin") {
      return NextResponse.json({ error: "Only the author or admin can remove contributors" }, { status: 403 });
    }

    const contributors = (hub.contributors || []).filter(
      (c: { toString: () => string }) => c.toString() !== userId
    );
    hub.contributors = contributors;
    await hub.save();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to remove contributor" }, { status: 500 });
  }
}
