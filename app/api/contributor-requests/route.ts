import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ContributorRequest from "@/lib/models/ContributorRequest";
import DocHub from "@/lib/models/DocHub";
import ExerciseHub from "@/lib/models/ExerciseHub";
import CheatsheetHub from "@/lib/models/CheatsheetHub";
import mongoose from "mongoose";

const HUB_MODELS = {
  doc: DocHub,
  exercise: ExerciseHub,
  cheatsheet: CheatsheetHub,
} as const;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { hubId, hubType } = body;
    if (!hubId || !hubType || !["doc", "exercise", "cheatsheet"].includes(hubType)) {
      return NextResponse.json({ error: "hubId and hubType (doc|exercise|cheatsheet) required" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(hubId)) {
      return NextResponse.json({ error: "Invalid hubId" }, { status: 400 });
    }

    await connectDB();
    const Hub = HUB_MODELS[hubType as keyof typeof HUB_MODELS];
    const hub = await Hub.findById(hubId);
    if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

    const authorIdStr = hub.authorId?.toString?.() ?? hub.authorId;
    if (authorIdStr === session.user.id) {
      return NextResponse.json({ error: "You are the author" }, { status: 400 });
    }
    const contributors = hub.contributors || [];
    if (contributors.some((c: { toString: () => string }) => c.toString() === session.user.id)) {
      return NextResponse.json({ error: "You are already a contributor" }, { status: 400 });
    }

    const existing = await ContributorRequest.findOne({
      hubId,
      hubType,
      userId: session.user.id,
      status: "pending",
    });
    if (existing) {
      return NextResponse.json({ error: "Request already pending" }, { status: 400 });
    }

    const request = await ContributorRequest.create({
      hubId,
      hubType,
      userId: session.user.id,
      status: "pending",
    });
    return NextResponse.json({
      id: request._id,
      hubId,
      hubType,
      status: request.status,
      createdAt: request.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

/** GET: For current user - their pending requests. For authors - pending requests for their hubs. */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode"); // "mine" | "inbox" (for authors)

    await connectDB();

    if (mode === "inbox") {
      const pending = await ContributorRequest.find({ status: "pending" })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .lean();

      const hubIdsByType = { doc: [] as string[], exercise: [] as string[], cheatsheet: [] as string[] };
      for (const r of pending) {
        hubIdsByType[r.hubType as keyof typeof hubIdsByType].push(r.hubId.toString());
      }

      const [docHubs, exHubs, csHubs] = await Promise.all([
        DocHub.find({ _id: { $in: hubIdsByType.doc }, authorId: session.user.id }).select("_id title").lean(),
        ExerciseHub.find({ _id: { $in: hubIdsByType.exercise }, authorId: session.user.id }).select("_id title").lean(),
        CheatsheetHub.find({ _id: { $in: hubIdsByType.cheatsheet }, authorId: session.user.id }).select("_id title").lean(),
      ]);
      const hubMap = new Map<string, { title: string }>();
      [...docHubs, ...exHubs, ...csHubs].forEach((h: { _id: { toString: () => string }; title: string }) =>
        hubMap.set(h._id.toString(), { title: h.title })
      );

      const inbox = pending
        .filter((r) => hubMap.has(r.hubId.toString()))
        .map((r) => ({
          id: r._id.toString(),
          hubId: r.hubId.toString(),
          hubType: r.hubType,
          hubTitle: hubMap.get(r.hubId.toString())?.title,
          user: r.userId,
          status: r.status,
          createdAt: r.createdAt,
        }));
      return NextResponse.json(inbox);
    }

    const mine = await ContributorRequest.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(
      mine.map((r) => ({
        id: r._id.toString(),
        hubId: r.hubId.toString(),
        hubType: r.hubType,
        status: r.status,
        createdAt: r.createdAt,
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
