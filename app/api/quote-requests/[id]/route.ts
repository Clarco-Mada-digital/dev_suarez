import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const patchSchema = z
  .object({
    action: z.enum(['accept', 'decline', 'counter']),
    counterBudgetMin: z.number().finite().nonnegative().optional(),
    counterBudgetMax: z.number().finite().nonnegative().optional(),
    counterDeadline: z.string().datetime().optional(),
    counterMessage: z.string().max(4000).optional(),
  })
  .refine(
    (data) =>
      data.action !== 'counter' ||
      !(
        data.counterBudgetMin != null &&
        data.counterBudgetMax != null &&
        (data.counterBudgetMax as number) < (data.counterBudgetMin as number)
      ),
    {
      message: 'Le budget maximum doit être supérieur ou égal au minimum',
      path: ['counterBudgetMax'],
    }
  );

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const id = params.id;
    const quote = await prisma.quoteRequest.findUnique({ where: { id } });
    if (!quote) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }

    // Autoriser la suppression par le client créateur ou le freelance destinataire
    const userId = session.user.id;
    if (quote.clientId !== userId && quote.freelancerId !== userId) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 });
    }

    await prisma.quoteRequest.delete({ where: { id } });
    return NextResponse.json({ ok: true, deletedId: id }, { status: 200 });
  } catch (e) {
    console.error('DELETE /api/quote-requests/[id] error', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const id = params.id;
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

    const quote = await prisma.quoteRequest.findUnique({ where: { id } });
    if (!quote) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }

    // Seul le freelance destinataire peut accepter/refuser
    if (quote.freelancerId !== session.user.id) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 });
    }

    if (quote.status !== 'PENDING') {
      return NextResponse.json({ error: 'La demande a déjà été traitée' }, { status: 400 });
    }

    const { action } = parsed.data;

    let updated;
    if (action === 'accept' || action === 'decline') {
      const status = action === 'accept' ? 'ACCEPTED' : 'DECLINED';
      updated = await prisma.quoteRequest.update({
        where: { id },
        data: { status },
      });
    } else {
      // counter
      const { counterBudgetMin, counterBudgetMax, counterDeadline, counterMessage } = parsed.data;
      updated = await prisma.quoteRequest.update({
        where: { id },
        data: {
          status: 'COUNTERED',
          counterBudgetMin: counterBudgetMin ?? null,
          counterBudgetMax: counterBudgetMax ?? null,
          counterDeadline: counterDeadline ? new Date(counterDeadline) : null,
          counterMessage: counterMessage ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true, quoteRequest: updated }, { status: 200 });
  } catch (e) {
    console.error('PATCH /api/quote-requests/[id] error', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
