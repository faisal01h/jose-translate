import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const languageSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().nullable().optional(),
  sourceLanguage: z.string().min(2).max(10).optional(),
  isActive: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const language = await prisma.language.findUnique({
    where: { id },
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

  if (!language) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ language });
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = languageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const language = await prisma.language.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ language });
  } catch {
    return NextResponse.json(
      { error: "Failed to update language" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    await prisma.language.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete language" },
      { status: 500 },
    );
  }
}
