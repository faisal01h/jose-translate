import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const ruleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  ruleType: z
    .enum(["PREFIX", "SUFFIX", "REPLACE", "REGEX", "WORD_ORDER"])
    .optional(),
  pattern: z.string().min(1).optional(),
  replacement: z.string().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
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
    const parsed = ruleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const rule = await prisma.grammaticalRule.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ rule });
  } catch {
    return NextResponse.json(
      { error: "Failed to update grammatical rule" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    await prisma.grammaticalRule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete grammatical rule" },
      { status: 500 },
    );
  }
}
