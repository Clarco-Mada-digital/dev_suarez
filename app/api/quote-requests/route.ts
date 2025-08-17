import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const createSchema = z
  .object({
    freelancerId: z.string().min(1),
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(4000),
    budgetMin: z.number().finite().nonnegative().optional(),
    budgetMax: z.number().finite().nonnegative().optional(),
    deadline: z.string().datetime().optional(),
  })
  .refine(
    (data) => !(data.budgetMin && data.budgetMax) || (data.budgetMax as number) >= (data.budgetMin as number),
    {
      message: 'Le budget maximum doit être supérieur ou égal au minimum',
      path: ['budgetMax'],
    }
  );

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Erreur de validation', details: parsed.error.flatten() }, { status: 400 });
    }

    const { freelancerId, title, description, budgetMin, budgetMax, deadline } = parsed.data;

    if (freelancerId === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas vous envoyer une demande" }, { status: 400 });
    }

    const freelancer = await prisma.user.findUnique({ where: { id: freelancerId }, select: { id: true, role: true } });
    if (!freelancer) {
      return NextResponse.json({ error: 'Freelance introuvable' }, { status: 404 });
    }
    if (freelancer.role !== 'FREELANCER') {
      return NextResponse.json({ error: "L'utilisateur ciblé n'est pas un freelance" }, { status: 400 });
    }

    const record = await prisma.quoteRequest.create({
      data: {
        clientId: session.user.id,
        freelancerId,
        title,
        description,
        budgetMin: budgetMin ?? null,
        budgetMax: budgetMax ?? null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ ok: true, quoteRequest: record }, { status: 201 });
  } catch (e) {
    console.error('POST /api/quote-requests error', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const [sent, received] = await Promise.all([
      prisma.quoteRequest.findMany({ where: { clientId: userId }, orderBy: { createdAt: 'desc' } }),
      prisma.quoteRequest.findMany({ where: { freelancerId: userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    return NextResponse.json({ sent, received }, { status: 200 });
  } catch (e) {
    console.error('GET /api/quote-requests error', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
