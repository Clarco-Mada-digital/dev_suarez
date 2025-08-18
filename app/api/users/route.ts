import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Vérifier que l'utilisateur est authentifié et est un administrateur
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' }, 
        { status: 401 }
      );
    }

    // Récupérer tous les utilisateurs avec leurs profils
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        _count: {
          select: {
            projectsAsClient: true,
            bidsAsFreelancer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Nettoyer les données sensibles avant de les envoyer
    const sanitizedUsers = users.map(({ emailVerified, ...userData }) => userData);

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}
