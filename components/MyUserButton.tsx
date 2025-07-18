'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from './ui/button';

export default function MyUserButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Déconnexion
    </Button>
  );
}