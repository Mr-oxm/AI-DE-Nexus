import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ExerciseHub from "@/lib/models/ExerciseHub";
import Star from "@/lib/models/Star";

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const editableOnly = searchParams.get("editable") === "true";

    let hubs = await ExerciseHub.find()
      .populate("authorId", "name")
      .populate("forkedFrom", "title")
      .sort({ createdAt: -1 })
      .lean();

    if (editableOnly) {
      if (!session?.user?.id) {
        return NextResponse.json([]);
      }
      const userId = session.user.id;
      hubs = hubs.filter((h) => {
        const authorIdStr =
          typeof h.authorId === "object" && h.authorId && "_id" in h.authorId
            ? String((h.authorId as { _id?: unknown })._id)
            : String(h.authorId);
        if (authorIdStr === userId) return true;
        const contribs = (h.contributors ?? []) as { toString?: () => string }[];
        return contribs.some((c) => (c?.toString?.() ?? String(c)) === userId);
      });
    }
    const hubObjectIds = hubs.map((h) => h._id);
    const [counts, starredIds] = await Promise.all([
      hubObjectIds.length > 0
        ? Star.aggregate([
            { $match: { targetType: "exerciseHub", targetId: { $in: hubObjectIds } } },
            { $group: { _id: "$targetId", count: { $sum: 1 } } },
          ])
        : [],
      session?.user?.id && hubObjectIds.length > 0
        ? Star.find({
            userId: session.user.id,
            targetType: "exerciseHub",
            targetId: { $in: hubObjectIds },
          })
            .select("targetId")
            .lean()
        : [],
    ]);
    const countMap = Object.fromEntries(
      counts.map((c: { _id: { toString: () => string }; count: number }) => [
        c._id.toString(),
        c.count,
      ])
    );
    const starredSet = new Set(
      starredIds.map((s: { targetId: { toString: () => string } }) =>
        s.targetId.toString()
      )
    );
    const result = hubs.map((h) => ({
      ...h,
      starCount: countMap[h._id.toString()] ?? 0,
      starred: session?.user?.id ? starredSet.has(h._id.toString()) : false,
    }));
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch exercise hubs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { title, description } = body;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    await connectDB();
    const hub = await ExerciseHub.create({
      title,
      description: description || "",
      authorId: session.user.id,
    });
    return NextResponse.json(hub);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create exercise hub" }, { status: 500 });
  }
}
