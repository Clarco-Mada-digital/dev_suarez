import { auth } from '@/auth';
import { prisma } from './prisma';

export const getAuth = () => {
  return auth;
};

export async function getCurrentUser() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  try {
    // Récupérer l'utilisateur depuis Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    // Récupérer ou créer l'utilisateur dans la base de données
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        image: clerkUser.imageUrl,
        lastSignInAt: new Date(),
      },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clockerUser.lastName || ''}`.trim() || null,
        image: clerkUser.imageUrl,
        emailVerified: new Date(),
        lastSignInAt: new Date(),
      },
    });

    return {
      ...user,
      // Ajoutez des propriétés supplémentaires de Clerk si nécessaire
      fullName: user.name,
      initials: user.name?.split(' ').map(n => n[0]).join('').toUpperCase(),
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  return user;
}
