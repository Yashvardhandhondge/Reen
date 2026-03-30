import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PunchRecord from "@/models/PunchRecord";
import { requireAuth } from "@/lib/auth";

export async function POST() {
  try {
    const user = await requireAuth("dev");
    await dbConnect();

    const today = new Date().toISOString().split("T")[0];

    const record = await PunchRecord.findOne({
      userId: user.userId,
      date: today,
      punchOut: null,
    });

    if (!record) {
      return NextResponse.json({ error: "No open punch record for today" }, { status: 400 });
    }

    record.punchOut = new Date();
    await record.save();

    return NextResponse.json({ record });
  } catch (e: any) {
    const status = e.message === "Unauthorized" ? 401 : e.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
