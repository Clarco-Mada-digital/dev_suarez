'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface UnauthorizedMessageProps {
  message: string;
  showLoginButton?: boolean;
}

export default function UnauthorizedMessage({ message, showLoginButton = false }: UnauthorizedMessageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-1">
          <ShieldOff className="mx-auto h-12 w-12 text-red-500" />
          <CardTitle className="text-2xl font-bold">Accès non autorisé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {showLoginButton && (
            <Button asChild>
              <Link href="/sign-in">Se connecter</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
