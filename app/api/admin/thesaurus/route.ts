import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const thesaurusSchema = z.object({
  languageId: z.string().min(1),
  word: z.string().min(1),
  related: z.string().min(1),
  relation: z.enum(["SYNONYM", "ANTONYM", "RELATED"]).default("SYNONYM"),
});

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const languageId = searchParams.get("languageId");

  const entries = await prisma.thesaurusEntry.findMany({
    where: languageId ? { languageId } : undefined,
    orderBy: [{ word: "asc" }, { related: "asc" }],
    include: { language: { select: { name: true, code: true } } },
  });

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = thesaurusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const entry = await prisma.thesaurusEntry.create({
      data: {
        ...parsed.data,
        word: parsed.data.word.toLowerCase(),
        related: parsed.data.related.toLowerCase(),
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create thesaurus entry" },
      { status: 500 },
    );
  }
}
