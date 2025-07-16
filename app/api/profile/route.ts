import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth.getSession();
    
    if (!session?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur avec son profil
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Créer un profil vide s'il n'existe pas
    if (!user.profile) {
      const newProfile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          bio: '',
          location: '',
          website: '',
          jobTitle: '',
          company: '',
          phoneNumber: ''
        }
      });
      
      return NextResponse.json(newProfile);
    }

    return NextResponse.json(user.profile);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    const data = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour ou créer le profil
    const updatedProfile = await prisma.userProfile.upsert({
      where: { 
        userId: user.id 
      },
      update: {
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        jobTitle: data.jobTitle || '',
        company: data.company || '',
        phoneNumber: data.phoneNumber || ''
      },
      create: {
        userId: user.id,
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        jobTitle: data.jobTitle || '',
        company: data.company || '',
        phoneNumber: data.phoneNumber || ''
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
