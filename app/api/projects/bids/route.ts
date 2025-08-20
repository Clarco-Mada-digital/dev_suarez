import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/services/notificationService';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await req.json();
    // Validation des données
    const { projectId, amount, proposal } = data; // Renommé 'message' en 'proposal'

    if (!projectId || !amount || !proposal) {
      return new NextResponse(
        JSON.stringify({ error: 'Tous les champs sont requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        bids: {
          include: {
            freelancer: true,
          },
        },
      },
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: 'Projet non trouvé' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur n'a pas déjà fait une offre sur ce projet
    const existingBid = project.bids.find((bid) => bid.freelancerId === userId);
    if (existingBid) {
      return new NextResponse(
        JSON.stringify({ error: "Vous avez déjà fait une offre sur ce projet" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Créer l'offre
    const bid = await prisma.projectBid.create({
      data: {
        amount,
        proposal,
        freelancer: {
          connect: { id: userId },
        },
        project: {
          connect: { id: projectId },
        },
      },
      include: {
        freelancer: true,
        project: true,
      },
    });

    // Envoyer une notification au client
    try {
      await notificationService.createNotification({
        userId: project.clientId,
        type: 'BID',
        title: 'Nouvelle offre reçue',
        message: `Vous avez reçu une nouvelle offre de ${session.user?.name || 'un freelance'} pour votre projet "${project.title}".`,
        relatedId: bid.id,
        relatedType: 'BID'
      });

      // Émettre un événement personnalisé pour mettre à jour le compteur
      const event = new CustomEvent('notification:new', {
        detail: { userId: project.clientId }
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(event);
      }

      // Envoyer une notification au freelance
      await notificationService.createNotification({
        userId: userId,
        type: 'BID',
        title: 'Offre envoyée',
        message: `Votre offre pour le projet "${project.title}" a été envoyée avec succès.`,
        relatedId: bid.id,
        relatedType: 'BID'
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi des notifications:", error);
      // Ne pas échouer la requête si les notifications échouent
    }

    return NextResponse.json(bid);
  } catch (error) {
    console.error("Erreur lors de la création de l'offre:", error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

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

    const isAdmin = session?.user?.role === 'ADMIN';
    if (!isAdmin && project.clientId !== userId) {
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
