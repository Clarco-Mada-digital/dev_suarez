'use client';

import { useTheme } from 'next-themes';
import { ReactNode, useState, useEffect } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Wait until the component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#2563eb',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          footerActionLink: 'text-primary hover:text-primary/80',
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}
