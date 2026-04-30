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
    const body = await req.json();
    const { action } = body; // "approve" | "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    await connectDB();
    const request = await ContributorRequest.findById(id);
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (request.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    const Hub = HUB_MODELS[request.hubType as keyof typeof HUB_MODELS];
    const hub = await Hub.findById(request.hubId);
    if (!hub) return NextResponse.json({ error: "Hub not found" }, { status: 404 });

    const role = (session.user as { role?: string }).role;
    const isAuthor = hub.authorId.toString() === session.user.id;
    if (!isAuthor && role !== "admin" && role !== "superadmin") {
      return NextResponse.json({ error: "Only the author or admin can approve/reject" }, { status: 403 });
    }

    request.status = action === "approve" ? "approved" : "rejected";
    await request.save();

    if (action === "approve") {
      const contributors = hub.contributors || [];
      if (!contributors.some((c: { toString: () => string }) => c.toString() === request.userId.toString())) {
        contributors.push(request.userId);
        hub.contributors = contributors;
        await hub.save();
      }
    }

    return NextResponse.json({
      id: request._id.toString(),
      status: request.status,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
