import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import DocHub from "@/lib/models/DocHub";
import ExerciseHub from "@/lib/models/ExerciseHub";
import CheatsheetHub from "@/lib/models/CheatsheetHub";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    const user = await User.findById(session.user.id)
      .select("name email role createdAt")
      .lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const [docHubs, exerciseHubs, cheatsheetHubs] = await Promise.all([
      DocHub.find({ authorId: session.user.id }).sort({ createdAt: -1 }).lean(),
      ExerciseHub.find({ authorId: session.user.id }).sort({ createdAt: -1 }).lean(),
      CheatsheetHub.find({ authorId: session.user.id }).sort({ createdAt: -1 }).lean(),
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
