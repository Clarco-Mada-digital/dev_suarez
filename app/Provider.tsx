"use client";

import Header from '@/components/Header';
import ThemeProvider from '@/components/theme/ThemeProvider';
import { frFR } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import React from 'react';
import { useTheme } from 'next-themes';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';

const Provider = ({ children }: React.PropsWithChildren<{}>) => {
  const { theme } = useTheme();

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" enableSystem defaultTheme="system">
        <Header />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default Provider;
