import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PunchRecord from "@/models/PunchRecord";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth("admin");
    const { id } = await params;
    await dbConnect();
    const punches = await PunchRecord.find({ userId: id }).sort({ date: -1 });
    return NextResponse.json({ punches });
  } catch (e: any) {
    const status = e.message === "Unauthorized" ? 401 : e.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
