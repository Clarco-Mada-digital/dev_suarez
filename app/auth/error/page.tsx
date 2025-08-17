'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Messages d'erreur personnalisés
  const errorMessages: Record<string, string> = {
    Configuration: 'Un problème de configuration est survenu. Veuillez réessayer plus tard.',
    AccessDenied: 'Accès refusé. Vous n\'avez pas les droits nécessaires.',
    Verification: 'Le lien de connexion a expiré ou est invalide. Veuillez réessayer.',
    Default: 'Une erreur est survenue lors de la connexion. Veuillez réessayer.',
  };

  const errorMessage = error && error in errorMessages 
    ? errorMessages[error as keyof typeof errorMessages] 
    : errorMessages.Default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Erreur de connexion</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {errorMessage}
          </p>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button asChild>
            <Link href="/login">
              Retour à la page de connexion
            </Link>
          </Button>
        </div>
        
        {error && (
          <div className="p-4 mt-6 text-sm text-gray-500 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-400">
            <p className="font-medium">Détails de l'erreur :</p>
            <p className="mt-1 font-mono">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
