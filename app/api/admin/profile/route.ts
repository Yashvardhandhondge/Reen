import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await requireAuth("admin");
    await dbConnect();
    const user = await User.findById(auth.userId).select("name email");
    if (!user) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    return NextResponse.json({ admin: { name: user.name, email: user.email } });
  } catch (e: any) {
    const status = e.message === "Unauthorized" ? 401 : e.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth("admin");
    const body = await req.json();
    const { name, password } = body as { name?: string; password?: string };

    if (!name && !password) {
      return NextResponse.json({ error: "Provide at least `name` or `password`" }, { status: 400 });
    }

    await dbConnect();

    const update: { name?: string; password?: string } = {};
    if (name) update.name = name;
    if (password) update.password = password;

    const updated = await User.findByIdAndUpdate(auth.userId, update, {
      new: true,
      runValidators: true,
    }).select("name email");

    if (!updated) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ admin: { name: updated.name, email: updated.email } });
  } catch (e: any) {
    const status = e.message === "Unauthorized" ? 401 : e.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}

