import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await _req.json();
    const { role: newRole } = body;

    if (!newRole || !["admin", "author"].includes(newRole)) {
      return NextResponse.json(
        { error: "role must be 'admin' or 'author'" },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await User.findById(id).select("role").lean();
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (existing.role === "superadmin") {
      return NextResponse.json(
        { error: "Cannot demote the absolute admin" },
        { status: 403 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: newRole },
      { new: true }
    )
      .select("name email role createdAt")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
