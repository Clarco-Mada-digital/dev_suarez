import { prisma } from '@/lib/prisma';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  jobTitle?: string;
  skills?: string[];
  availability?: boolean;
  rating?: number;
  hourlyRate?: number;
  location?: string;
}

export async function getTopFreelancers(limit: number = 6): Promise<UserProfile[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'FREELANCER', // Seulement les freelancers
      },
      take: limit,
      orderBy: {
        // Ici vous pouvez ajouter une logique de tri par note ou autre critère
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        // Ajoutez d'autres champs nécessaires pour la carte utilisateur
        profile: {
          select: {
            jobTitle: true,
            skills: true,
            availability: true,
            rating: true,
            hourlyRate: true,
            location: true,
          },
        },
      },
    });

    // Transformer les données pour correspondre à l'interface attendue
    return users.map(user => ({
      id: user.id,
      name: user.name || 'Utilisateur sans nom',
      email: user.email,
      image: user.image,
      role: user.role,
      jobTitle: user.profile?.jobTitle || 'Freelance',
      skills: user.profile?.skills || [],
      availability: user.profile?.availability || false,
      rating: user.profile?.rating || 0,
      hourlyRate: user.profile?.hourlyRate || 0,
      location: user.profile?.location || 'Non spécifié',
    }));
  } catch (error) {
    console.error('Error fetching top freelancers:', error);
    return [];
  }
}
