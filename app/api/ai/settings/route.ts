import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const settingsSchema = z.object({
  provider: z.enum(["mock", "openai", "openrouter"]),
  model: z.string().optional().nullable(),
  temperature: z.number().min(0).max(2),
});

export async function GET() {
  try {
    // Ensure we always have a singleton row
    const current = await prisma.aiSettings.findUnique({ where: { id: "global" } });
    if (!current) {
      const created = await prisma.aiSettings.create({
        data: { id: "global", provider: "mock", model: null, temperature: 0.4 },
      });
      return NextResponse.json(created);
    }
    return NextResponse.json(current);
  } catch (e) {
    console.error("GET /api/ai/settings error", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const role = (session as any)?.user?.role as string | undefined;
    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const json = await req.json();
    const parsed = settingsSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { provider, model, temperature } = parsed.data;

    const updated = await prisma.aiSettings.upsert({
      where: { id: "global" },
      create: {
        id: "global",
        provider,
        model: model ?? null,
        temperature,
        updatedBy: (session as any)?.user?.id,
      },
      update: {
        provider,
        model: model ?? null,
        temperature,
        updatedBy: (session as any)?.user?.id,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/ai/settings error", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
