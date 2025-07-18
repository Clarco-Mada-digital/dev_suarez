'use client';

import { useEffect, useState } from 'react';
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
}

export function useUser(): UseUserResult {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === 'loading') {
        setLoading(true);
        return;
      }

      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetch(`/api/profile/${session.user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user profile');
          }
          const profileData = await response.json();
          setUser({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: session.user.role,
            profile: profileData,
          });
          setError(null);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setUser(null);
        setError(new Error('User not authenticated'));
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [session, status]);

  return {
    user,
    loading,
    isAuthenticated: status === 'authenticated',
    error,
  };
}
