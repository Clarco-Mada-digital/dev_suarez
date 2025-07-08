'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/auth';
import { Loader2 } from 'lucide-react';

type RoleBasedProps = {
  children: ReactNode;
  allowedRoles?: string[];
  fallback?: ReactNode;
};

export function RoleBased({ 
  children, 
  allowedRoles = ['ADMIN'],
  fallback = null 
}: RoleBasedProps) {
  const { userId, sessionClaims } = auth();
  const userRole = sessionClaims?.metadata?.role as string || 'USER';
  const hasAccess = allowedRoles.includes(userRole);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return <>{fallback}</> || (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
        <p className="text-muted-foreground">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
