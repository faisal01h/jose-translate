import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearAdminSession,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/auth";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    if (!verifyAdminPassword(parsed.data.password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await setAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
