import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  buildTranslationContext,
  translateText,
  translateTextFromFictional,
} from "@/lib/translate";

const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  languageCode: z.string().min(1),
  direction: z.enum(["to-fictional", "from-fictional"]).default("to-fictional"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = translateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const language = await prisma.language.findFirst({
      where: {
        code: parsed.data.languageCode,
        isActive: true,
      },
      include: {
        dictionaryEntries: true,
        grammaticalRules: true,
        thesaurusEntries: true,
      },
    });

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 },
      );
    }

    const context = buildTranslationContext(
      language.dictionaryEntries,
      language.grammaticalRules,
      language.thesaurusEntries,
    );

    const result =
      parsed.data.direction === "from-fictional"
        ? translateTextFromFictional(parsed.data.text, context)
        : translateText(parsed.data.text, context);

    return NextResponse.json({
      ...result,
      direction: parsed.data.direction,
      language: {
        name: language.name,
        code: language.code,
        sourceLanguage: language.sourceLanguage,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const languages = await prisma.language.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      sourceLanguage: true,
    },
  });

  return NextResponse.json({ languages });
}
