import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

/** Public endpoint: returns whether any users exist (for register page to show/hide admin secret) */
export async function GET() {
  try {
    await connectDB();
    const count = await User.countDocuments();
    return NextResponse.json({ exists: count > 0 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
