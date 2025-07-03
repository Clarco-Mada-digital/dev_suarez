import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const data = await req.json();
    const { projectId, amount, proposal } = data;

    // Vérifier que le projet existe et est toujours ouvert
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return new NextResponse('Projet non trouvé', { status: 404 });
    }

    if (project.status !== 'OPEN') {
      return new NextResponse('Ce projet n\'est plus ouvert aux candidatures', { status: 400 });
    }

    // Vérifier que l'utilisateur n'a pas déjà postulé
    const existingBid = await prisma.projectBid.findFirst({
      where: {
        projectId,
        freelancerId: userId,
      },
    });

    if (existingBid) {
      return new NextResponse('Vous avez déjà postulé à ce projet', { status: 400 });
    }

    // Créer l'offre
    const bid = await prisma.projectBid.create({
      data: {
        amount: parseFloat(amount),
        proposal,
        status: 'PENDING',
        projectId,
        freelancerId: userId,
      },
    });

    return NextResponse.json({ bidId: bid.id });
  } catch (error) {
    console.error('Error creating bid:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return new NextResponse('ID de projet manquant', { status: 400 });
    }

    // Vérifier que l'utilisateur est le propriétaire du projet
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    });

    if (!project) {
      return new NextResponse('Projet non trouvé', { status: 404 });
    }

    if (project.clientId !== userId) {
      return new NextResponse('Non autorisé', { status: 403 });
    }

    // Récupérer toutes les offres pour ce projet
    const bids = await prisma.projectBid.findMany({
      where: { projectId },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
