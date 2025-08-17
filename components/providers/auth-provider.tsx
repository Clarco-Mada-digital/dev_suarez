'use client';

import { ReactNode, useState, useEffect } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Keep a minimal mount guard to avoid hydration mismatch when themes/providers exist elsewhere
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{children}</>;
  return <>{children}</>;
}
