import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Star from "@/lib/models/Star";

/** POST body: { items: [{ targetType, targetId }] } - returns { [targetId]: count } */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({});
    }

    await connectDB();
    const counts: Record<string, number> = {};
    await Promise.all(
      items.map(async ({ targetType, targetId }: { targetType: string; targetId: string }) => {
        const count = await Star.countDocuments({ targetType, targetId });
        counts[targetId] = count;
      })
    );
    return NextResponse.json(counts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get counts" }, { status: 500 });
  }
}
