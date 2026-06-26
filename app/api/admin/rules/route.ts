import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const ruleSchema = z.object({
  languageId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  ruleType: z.enum(["PREFIX", "SUFFIX", "REPLACE", "REGEX", "WORD_ORDER"]),
  pattern: z.string().min(1),
  replacement: z.string().default(""),
  priority: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const languageId = searchParams.get("languageId");

  const rules = await prisma.grammaticalRule.findMany({
    where: languageId ? { languageId } : undefined,
    orderBy: [{ priority: "desc" }, { name: "asc" }],
    include: { language: { select: { name: true, code: true } } },
  });

  return NextResponse.json({ rules });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = ruleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const rule = await prisma.grammaticalRule.create({ data: parsed.data });
    return NextResponse.json({ rule }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create grammatical rule" },
      { status: 500 },
    );
  }
}
