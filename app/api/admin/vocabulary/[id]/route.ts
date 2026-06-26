import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const vocabularySchema = z.object({
  word: z.string().min(1).optional(),
  definition: z.string().min(1).optional(),
  partOfSpeech: z.string().nullable().optional(),
  example: z.string().nullable().optional(),
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
    const parsed = vocabularySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const vocabulary = await prisma.vocabulary.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ vocabulary });
  } catch {
    return NextResponse.json(
      { error: "Failed to update vocabulary" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    await prisma.vocabulary.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete vocabulary" },
      { status: 500 },
    );
  }
}
