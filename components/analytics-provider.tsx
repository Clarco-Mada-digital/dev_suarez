'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ne pas suivre les pages admin
    if (pathname?.startsWith('/admin')) {
      return;
    }

    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    analytics.trackPageView(url);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
