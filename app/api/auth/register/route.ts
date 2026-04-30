import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const { email, password, name, adminSecret } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // First user with ADMIN_SECRET = superadmin (absolute admin, cannot be demoted)
    // First user without = admin; others = author (admins promote via dashboard)
    const isFirstUser = (await User.countDocuments()) === 0;
    const hasValidAdminSecret =
      process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET;
    const role = isFirstUser && hasValidAdminSecret ? "superadmin" : isFirstUser ? "admin" : "author";

    const user = await User.create({ email, password, name, role });
    return NextResponse.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
