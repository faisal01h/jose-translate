import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const thesaurusSchema = z.object({
  word: z.string().min(1).optional(),
  related: z.string().min(1).optional(),
  relation: z.enum(["SYNONYM", "ANTONYM", "RELATED"]).optional(),
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
    const parsed = thesaurusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = {
      ...parsed.data,
      ...(parsed.data.word ? { word: parsed.data.word.toLowerCase() } : {}),
      ...(parsed.data.related
        ? { related: parsed.data.related.toLowerCase() }
        : {}),
    };

    const entry = await prisma.thesaurusEntry.update({
      where: { id },
      data,
    });

    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json(
      { error: "Failed to update thesaurus entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    await prisma.thesaurusEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete thesaurus entry" },
      { status: 500 },
    );
  }
}
