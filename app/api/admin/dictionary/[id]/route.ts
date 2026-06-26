import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const entrySchema = z.object({
  sourceWord: z.string().min(1).optional(),
  targetWord: z.string().min(1).optional(),
  partOfSpeech: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = entrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = {
      ...parsed.data,
      ...(parsed.data.sourceWord
        ? { sourceWord: parsed.data.sourceWord.toLowerCase() }
        : {}),
    };

    const entry = await prisma.dictionaryEntry.update({
      where: { id },
      data,
    });

    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json(
      { error: "Failed to update dictionary entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    await prisma.dictionaryEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete dictionary entry" },
      { status: 500 },
    );
  }
}
