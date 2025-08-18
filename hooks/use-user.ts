'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface UserProfileData {
  id: string;
  bio?: string;
  location?: string;
  website?: string;
  jobTitle?: string;
  company?: string;
  phoneNumber?: string;
  skills?: string;
  languages?: string;
  awards?: string;
  availability: boolean;
  rating?: number;
  hourlyRate?: number;
}

interface UserData {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  profile?: UserProfileData;
}

interface UseUserResult {
  user: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  mutate: () => Promise<void>;
}

export function useUser(): UseUserResult {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserData = useCallback(async () => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (!session?.user?.id) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const apiData = await response.json();
      setUser({
        id: session.user.id,
        name: apiData?.name ?? session.user.name,
        email: apiData?.email ?? session.user.email,
        image: apiData?.image ?? session.user.image,
        role: apiData?.role ?? session.user.role,
        profile: apiData?.profile ?? undefined,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err : new Error('An error occurred'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // Fonction pour forcer le rafraîchissement des données
  const mutate = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    user,
    loading,
    isAuthenticated: status === 'authenticated',
    error,
    mutate,
  };
}
