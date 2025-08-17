import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que l'utilisateur est authentifié
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Récupérer l'utilisateur avec ses projets et offres
    const userData = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
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
            proposal: true,
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

    if (!userData) {
      return new NextResponse('Utilisateur non trouvé', { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier que l'utilisateur est authentifié
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Vérifier que l'utilisateur met à jour son propre profil ou est un administrateur
    if (session.user.id !== params.id && session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await request.json();

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: data.name,
        image: data.image,
        // Ne pas permettre la mise à jour du rôle sauf pour les administrateurs
        ...(session.user.role === 'ADMIN' && { role: data.role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        projectsAsClient: {
          select: {
            id: true,
            title: true,
          },
          take: 5,
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
