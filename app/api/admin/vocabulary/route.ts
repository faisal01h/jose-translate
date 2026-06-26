import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const vocabularySchema = z.object({
  languageId: z.string().min(1),
  word: z.string().min(1),
  definition: z.string().min(1),
  partOfSpeech: z.string().optional(),
  example: z.string().optional(),
});

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const languageId = searchParams.get("languageId");

  const vocabularies = await prisma.vocabulary.findMany({
    where: languageId ? { languageId } : undefined,
    orderBy: { word: "asc" },
    include: { language: { select: { name: true, code: true } } },
  });

  return NextResponse.json({ vocabularies });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = vocabularySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const vocabulary = await prisma.vocabulary.create({ data: parsed.data });
    return NextResponse.json({ vocabulary }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create vocabulary" },
      { status: 500 },
    );
  }
}
