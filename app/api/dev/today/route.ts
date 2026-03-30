import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PunchRecord from "@/models/PunchRecord";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth("dev");
    await dbConnect();

    const today = new Date().toISOString().split("T")[0];
    const record = await PunchRecord.findOne({ userId: user.userId, date: today });

    return NextResponse.json({ record: record || null });
  } catch (e: any) {
    const status = e.message === "Unauthorized" ? 401 : e.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
