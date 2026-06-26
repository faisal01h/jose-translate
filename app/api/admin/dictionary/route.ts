import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const entrySchema = z.object({
  languageId: z.string().min(1),
  sourceWord: z.string().min(1),
  targetWord: z.string().min(1),
  partOfSpeech: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const languageId = searchParams.get("languageId");

  const entries = await prisma.dictionaryEntry.findMany({
    where: languageId ? { languageId } : undefined,
    orderBy: { sourceWord: "asc" },
    include: { language: { select: { name: true, code: true } } },
  });

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = entrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const entry = await prisma.dictionaryEntry.create({
      data: {
        ...parsed.data,
        sourceWord: parsed.data.sourceWord.toLowerCase(),
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create dictionary entry" },
      { status: 500 },
    );
  }
}
