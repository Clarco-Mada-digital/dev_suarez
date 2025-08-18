import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  jobTitle?: string | null;
  skills: string[];
  availability: boolean;
  rating?: number;
  ratingCount: number;
  hourlyRate?: number | null;
  location?: string | null;
  completedProjectsCount: number;
  bio?: string | null;
}

export async function getFreelancers(): Promise<Freelancer[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
        profile: { isNot: null }
      },
      include: {
        profile: true
      }
    });

    // Transformer les données pour correspondre à l'interface Freelancer
    return users.map(user => ({
      id: user.id,
      name: user.name || 'Anonyme',
      email: user.email,
      image: user.image,
      jobTitle: user.profile?.jobTitle || 'Freelance',
      skills: user.profile?.skills ? user.profile.skills.split(',').map(s => s.trim()) : [],
      availability: user.profile?.availability || false,
      rating: user.profile?.rating || 0,
      ratingCount: user.profile?.ratingCount || 0,
      hourlyRate: user.profile?.hourlyRate || 0,
      location: user.profile?.location || null,
      completedProjectsCount: user.profile?.completedProjectsCount || 0,
      bio: user.profile?.bio || null
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des freelances:', error);
    throw new Error('Impossible de charger les freelances');
  } finally {
    await prisma.$disconnect();
  }
}
