import { prisma } from '@/lib/prisma';
// Types

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  jobTitle?: string | null;
  skills: string[];
  availability?: boolean;
  rating?: number | null;
  ratingCount?: number | null;
  hourlyRate?: number | null;
  location?: string | null;
  bio?: string | null;
  website?: string | null;
  phoneNumber?: string | null;
  company?: string | null;
  completedProjectsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les données de profil à jour

// Interface pour les données de mise à jour du profil
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  skills?: string[] | null;
  availability?: boolean | null;
  rating?: number | null;
  hourlyRate?: number | null;
}

/**
 * Récupère un utilisateur par son ID (NextAuth/Prisma)
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) return null;

    const skills = user.profile?.skills
      ? user.profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    return {
      id: user.id,
      name: user.name || '',
      email: user.email,
      image: user.image,
      role: user.role,
      jobTitle: user.profile?.jobTitle ?? null,
      skills,
      availability: user.profile?.availability ?? false,
      rating: user.profile?.rating ?? null,
      hourlyRate: user.profile?.hourlyRate ?? null,
      location: user.profile?.location ?? null,
      bio: user.profile?.bio ?? null,
      website: user.profile?.website ?? null,
      phoneNumber: user.profile?.phoneNumber ?? null,
      company: user.profile?.company ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching user by id:', error);
    throw error;
  }
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileData
): Promise<UserProfile> {
  try {
    // 1) Mettre à jour les informations de base de l'utilisateur si nécessaire
    const name = data.firstName && data.lastName
      ? `${data.firstName} ${data.lastName}`
      : data.firstName || data.lastName || undefined;

    if (name || data.email) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name ? { name } : {}),
          ...(data.email ? { email: data.email } : {}),
        },
      });
    }

    // 2) Upsert du profil utilisateur
    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.website !== undefined ? { website: data.website } : {}),
        ...(data.jobTitle !== undefined ? { jobTitle: data.jobTitle } : {}),
        ...(data.company !== undefined ? { company: data.company } : {}),
        ...(data.skills !== undefined ? { skills: Array.isArray(data.skills) ? data.skills.join(', ') : null } : {}),
        ...(data.availability !== undefined ? { availability: !!data.availability } : {}),
        ...(data.rating !== undefined ? { rating: data.rating } : {}),
        ...(data.hourlyRate !== undefined ? { hourlyRate: data.hourlyRate } : {}),
      },
      create: {
        userId,
        phoneNumber: data.phoneNumber ?? null,
        bio: data.bio ?? null,
        location: data.location ?? null,
        website: data.website ?? null,
        jobTitle: data.jobTitle ?? null,
        company: data.company ?? null,
        skills: Array.isArray(data.skills) ? data.skills.join(', ') : null,
        availability: data.availability ?? false,
        rating: data.rating ?? null,
        hourlyRate: data.hourlyRate ?? null,
      },
    });

    // 3) Retourner le profil mis à jour
    const updated = await getUserById(userId);
    if (!updated) throw new Error('Échec de la récupération des données mises à jour');
    return updated;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Récupère les meilleurs freelancers
 */
export async function getTopFreelancers(limit: number = 6): Promise<UserProfile[]> {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'FREELANCER' },
      include: {
        profile: true,
        bidsAsFreelancer: {
          where: { status: 'ACCEPTED' },
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return users.map((u) => {
      const completedProjects = u.bidsAsFreelancer.length;
      const skills = u.profile?.skills
        ? u.profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const rating = u.profile?.rating ?? Math.min(5, (completedProjects / 10) * 5);
      const completedProjectsCount = (u.profile as any)?.completedProjectsCount ?? completedProjects;

      return {
        id: u.id,
        name: u.name || 'Freelancer',
        email: u.email,
        image: u.image,
        role: u.role,
        jobTitle: u.profile?.jobTitle ?? 'Freelance',
        skills,
        availability: u.profile?.availability ?? false,
        rating,
        hourlyRate: u.profile?.hourlyRate ?? null,
        location: u.profile?.location ?? null,
        bio: u.profile?.bio ?? null,
        website: u.profile?.website ?? null,
        phoneNumber: u.profile?.phoneNumber ?? null,
        company: u.profile?.company ?? null,
        completedProjectsCount,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    });
  } catch (error) {
    console.error('Error fetching top freelancers:', error);
    return [];
  }
}
