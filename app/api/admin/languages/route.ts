import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const languageSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  sourceLanguage: z.string().min(2).max(10).default("en"),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const languages = await prisma.language.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          dictionaryEntries: true,
          vocabularies: true,
          grammaticalRules: true,
          thesaurusEntries: true,
        },
      },
    },
  });

  return NextResponse.json({ languages });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = languageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const language = await prisma.language.create({ data: parsed.data });
    return NextResponse.json({ language }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create language" },
      { status: 500 },
    );
  }
}
