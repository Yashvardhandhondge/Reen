import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PunchRecord from "@/models/PunchRecord";
import { requireAuth } from "@/lib/auth";

export async function POST() {
  try {
    const user = await requireAuth("dev");
    await dbConnect();

    const today = new Date().toISOString().split("T")[0];

    const existing = await PunchRecord.findOne({ userId: user.userId, date: today });
    if (existing) {
      return NextResponse.json({ error: "Already punched in today" }, { status: 400 });
    }

    const record = await PunchRecord.create({
      userId: user.userId,
      punchIn: new Date(),
      punchOut: null,
      date: today,
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (e: any) {
    const status = e.message === "Unauthorized" ? 401 : e.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
