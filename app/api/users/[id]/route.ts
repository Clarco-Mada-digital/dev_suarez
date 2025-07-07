import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que l'utilisateur est authentifié
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    // Récupérer l'utilisateur avec ses projets et offres
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        projectsAsClient: {
          select: {
            id: true,
            title: true,
            status: true,
            budget: true,
            createdAt: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            skills: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                bids: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        bidsAsFreelancer: {
          select: {
            id: true,
            amount: true,
            message: true,
            status: true,
            createdAt: true,
            project: {
              select: {
                id: true,
                title: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                client: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return new NextResponse('Utilisateur non trouvé', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
