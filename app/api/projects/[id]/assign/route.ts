import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === 'ADMIN';

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        bids: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    if (!isAdmin && project.clientId !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    if (project.status !== 'OPEN') {
      return NextResponse.json({ error: 'Le projet ne peut être assigné que lorsqu’il est "OPEN"' }, { status: 400 });
    }

    const body = await req.json();
    const { bidId, freelancerId } = body as { bidId?: string; freelancerId?: string };

    if (!bidId && !freelancerId) {
      return NextResponse.json(
        { error: 'bidId ou freelancerId requis' },
        { status: 400 }
      );
    }

    let chosenFreelancerId = freelancerId ?? null;

    if (bidId) {
      const chosenBid = project.bids.find((b) => b.id === bidId);
      if (!chosenBid) {
        return NextResponse.json(
          { error: "Offre introuvable pour ce projet" },
          { status: 404 }
        );
      }
      chosenFreelancerId = chosenBid.freelancerId;
    } else if (freelancerId) {
      const hasBid = project.bids.some((b) => b.freelancerId === freelancerId);
      if (!hasBid) {
        return NextResponse.json(
          { error: "Ce freelance n'a pas postulé à ce projet" },
          { status: 400 }
        );
      }
    }

    // Effectuer l'assignation dans une transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Mettre le statut du projet à IN_PROGRESS et enregistrer le freelance choisi
      const proj = await tx.project.update({
        where: { id: params.id },
        data: {
          assignedFreelancerId: chosenFreelancerId!,
          status: 'IN_PROGRESS',
        },
      });

      // Mettre à jour les statuts des offres
      await tx.projectBid.updateMany({
        where: { projectId: params.id, freelancerId: chosenFreelancerId! },
        data: { status: 'ACCEPTED' },
      });
      await tx.projectBid.updateMany({
        where: { projectId: params.id, NOT: { freelancerId: chosenFreelancerId! } },
        data: { status: 'REJECTED' },
      });

      return tx.project.findUnique({
        where: { id: proj.id },
        include: {
          assignedFreelancer: {
            select: { id: true, name: true, image: true },
          },
          bids: true,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[POST /api/projects/[id]/assign] Error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
