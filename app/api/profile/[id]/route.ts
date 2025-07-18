import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Permettre l'accès public aux profils
    // if (!currentUserId || currentUserId !== params.id) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        projectsAsClient: {
          select: {
            id: true,
            title: true,
            description: true,
            skills: {
              select: { name: true },
            },
          },
        },
        bidsAsFreelancer: {
          where: {
            status: 'ACCEPTED', // Seulement les offres acceptées comme expérience
          },
          select: {
            id: true,
            proposal: true,
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Si le profil n'existe pas, le créer avec des valeurs par défaut
    if (!user.profile) {
      user.profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          bio: '',
          location: '',
          website: '',
          jobTitle: '',
          company: '',
          phoneNumber: '',
          skills: '',
          languages: '',
          awards: '',
          availability: false,
          rating: 0,
          hourlyRate: 0,
        },
      });
    }

    // Formater les données pour le frontend
    const formattedProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      profile: user.profile,
      projectsAsClient: user.projectsAsClient.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        tags: project.skills.map(skill => skill.name),
      })),
      acceptedBidsAsFreelancer: user.bidsAsFreelancer.map(bid => ({
        id: bid.id,
        proposal: bid.proposal,
        projectTitle: bid.project.title,
      })),
    };

    return NextResponse.json(formattedProfile);
  } catch (error) {
    console.error('[API/PROFILE/GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId || currentUserId !== params.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: params.id },
      update: {
        bio: body.bio,
        location: body.location,
        website: body.website,
        jobTitle: body.jobTitle,
        company: body.company,
        phoneNumber: body.phoneNumber,
        skills: body.skills,
        languages: body.languages,
        awards: body.awards,
        availability: body.availability,
        rating: body.rating,
        hourlyRate: body.hourlyRate,
      },
      create: {
        userId: params.id,
        bio: body.bio,
        location: body.location,
        website: body.website,
        jobTitle: body.jobTitle,
        company: body.company,
        phoneNumber: body.phoneNumber,
        skills: body.skills,
        languages: body.languages,
        awards: body.awards,
        availability: body.availability,
        rating: body.rating,
        hourlyRate: body.hourlyRate,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('[API/PROFILE/PATCH]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
