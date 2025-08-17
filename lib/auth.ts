import { auth } from '@/auth';
import { prisma } from './prisma';

export const getAuth = () => {
  return auth;
};

export async function getCurrentUser() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) return null;

    const fullName = user.name ?? null;
    const initials = fullName
      ? fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : undefined;

    return { ...user, fullName, initials } as const;
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
