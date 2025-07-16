'use client';

import { useTheme } from 'next-themes';
import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          {children}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            En utilisant ce service, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
}

export const authStyles = {
  card: 'shadow-none w-full',
  headerTitle: 'text-2xl font-bold text-gray-900 dark:text-white mb-1',
  headerSubtitle: 'text-gray-600 dark:text-gray-300 text-sm',
  formFieldLabel: 'text-gray-700 dark:text-gray-300 text-sm font-medium',
  formFieldInput: 'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm',
  footerActionText: 'text-gray-600 dark:text-gray-400 text-sm',
  footerActionLink: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium',
  dividerLine: 'bg-gray-300 dark:bg-gray-600',
  dividerText: 'text-gray-500 dark:text-gray-400 text-sm',
  socialButtonsBlockButton: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
  socialButtonsBlockButtonText: 'text-gray-800 dark:text-gray-200 text-sm',
  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors text-sm',
  formFieldAction: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm',
  formHeaderTitle: 'text-2xl font-bold text-center mb-2',
  formHeaderSubtitle: 'text-center mb-6',
};
