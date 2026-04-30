import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DocHub from "@/lib/models/DocHub";
import ExerciseHub from "@/lib/models/ExerciseHub";
import CheatsheetHub from "@/lib/models/CheatsheetHub";
import User from "@/lib/models/User";
import mongoose from "mongoose";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    await connectDB();

    const user = await User.findById(userId)
      .select("name createdAt")
      .lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const [docHubs, exerciseHubs, cheatsheetHubs] = await Promise.all([
      DocHub.find({ authorId: userId }).sort({ createdAt: -1 }).lean(),
      ExerciseHub.find({ authorId: userId }).sort({ createdAt: -1 }).lean(),
      CheatsheetHub.find({ authorId: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      user: { ...user, id: user._id },
      docHubs,
      exerciseHubs,
      cheatsheetHubs,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
