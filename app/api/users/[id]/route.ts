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
        profile: {
          select: {
            bio: true,
            location: true,
            website: true,
            jobTitle: true,
            company: true,
            phoneNumber: true,
            skills: true,
            languages: true,
            awards: true,
            availability: true,
            rating: true,
            hourlyRate: true,
          },
        },
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
      return NextResponse.json(
        { message: 'Non autorisé' }, 
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur met à jour son propre profil ou est un administrateur
    if (session.user.id !== params.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Accès non autorisé à cette ressource' }, 
        { status: 403 }
      );
    }

    let data;
    try {
      data = await request.json();
    } catch (error) {
      return NextResponse.json(
        { message: 'Données JSON invalides' },
        { status: 400 }
      );
    }

    // Valider les données reçues
    if (data.name === '') {
      return NextResponse.json(
        { message: 'Le nom ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur
    try {
      const updateData: any = {};
      
      // Mettre à jour les champs de base de l'utilisateur
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.image !== undefined) updateData.image = data.image;
      
      // Mettre à jour le rôle uniquement pour les administrateurs
      if (session.user.role === 'ADMIN' && data.role !== undefined) {
        updateData.role = data.role;
      }
      
      // Préparer les données du profil
      const profileData = data.profile || {};
      
      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: {
          ...updateData,
          // Mettre à jour ou créer le profil
          profile: {
            upsert: {
              create: {
                bio: profileData.bio || '',
                location: profileData.location || '',
                website: profileData.website || '',
                jobTitle: profileData.jobTitle || '',
                company: profileData.company || '',
                phoneNumber: profileData.phoneNumber || '',
                skills: profileData.skills || '',
                languages: profileData.languages || '',
                awards: profileData.awards || '',
                availability: profileData.availability || false,
                rating: profileData.rating || 0,
                hourlyRate: profileData.hourlyRate || 0,
              },
              update: {
                bio: profileData.bio,
                location: profileData.location,
                website: profileData.website,
                jobTitle: profileData.jobTitle,
                company: profileData.company,
                phoneNumber: profileData.phoneNumber,
                skills: profileData.skills,
                languages: profileData.languages,
                awards: profileData.awards,
                availability: profileData.availability,
                rating: profileData.rating,
                hourlyRate: profileData.hourlyRate,
              },
            },
          },
        },
        include: {
          profile: true,
          _count: {
            select: {
              projectsAsClient: true,
              bidsAsFreelancer: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        user: updatedUser
      });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { message: 'Une erreur inattendue est survenue' },
      { status: 500 }
    );
  }
}
