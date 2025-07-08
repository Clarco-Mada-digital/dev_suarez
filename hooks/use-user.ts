'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/auth';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';

type UseUserOptions = {
  redirectTo?: string | null;
  redirectIfFound?: boolean;
};

export function useUser({ 
  redirectTo = null, 
  redirectIfFound = false 
}: UseUserOptions = {}) {
  const router = useRouter();
  const { userId, sessionClaims } = auth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (!redirectTo || loading) return;

    // Si l'utilisateur n'est pas connecté et qu'une redirection est demandée
    if (!userId && redirectTo && !redirectIfFound) {
      router.push(redirectTo);
    }
    
    // Si l'utilisateur est connecté et qu'une redirection est demandée quand l'utilisateur est trouvé
    if (userId && redirectIfFound) {
      router.push(redirectTo || '/dashboard');
    }
  }, [userId, loading, redirectTo, redirectIfFound, router]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!userId,
    role: sessionClaims?.metadata?.role as string || 'USER',
    session: sessionClaims,
  };
}
