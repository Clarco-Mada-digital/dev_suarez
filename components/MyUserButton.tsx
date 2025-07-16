'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/auth';

export default function MyUserButton() {
  const router = useRouter();
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  return (
    <Button
      variant="outline"
      onClick={() => {
        auth.removeEmail();
        router.push('/sign-in');
      }}
      className="text-sm"
    >
      Déconnexion
    </Button>
  );
}
