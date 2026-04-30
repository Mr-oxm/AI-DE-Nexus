import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Star from "@/lib/models/Star";
import mongoose from "mongoose";

const TARGET_TYPES = ["docHub", "exerciseHub", "cheatsheetHub"] as const;

/** POST: Toggle star. Body: { targetType, targetId } */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { targetType, targetId } = body;
    if (!targetType || !targetId || !TARGET_TYPES.includes(targetType)) {
      return NextResponse.json({ error: "targetType and targetId required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return NextResponse.json({ error: "Invalid targetId" }, { status: 400 });
    }

    await connectDB();
    const existing = await Star.findOne({
      userId: session.user.id,
      targetType,
      targetId,
    });
    if (existing) {
      await Star.findByIdAndDelete(existing._id);
      return NextResponse.json({ starred: false });
    }
    await Star.create({
      userId: session.user.id,
      targetType,
      targetId,
    });
    return NextResponse.json({ starred: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to toggle star" }, { status: 500 });
  }
}

/** GET: ?targetType=docHub&targetId=xxx - check if current user starred. Or ?userId=xxx - list user's stars */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");
    const userId = searchParams.get("userId");

    await connectDB();

    if (targetType && targetId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ starred: false });
      }
      const star = await Star.findOne({
        userId: session.user.id,
        targetType,
        targetId,
      });
      return NextResponse.json({ starred: !!star });
    }

    if (userId) {
      const stars = await Star.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json(
        stars.map((s) => ({
          targetType: s.targetType,
          targetId: s.targetId.toString(),
        }))
      );
    }

    return NextResponse.json({ error: "Provide targetType+targetId or userId" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch stars" }, { status: 500 });
  }
}
