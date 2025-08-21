'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PageData {
  page: string;
  visitors: number;
  pageviews: number;
  bounceRate: string;
}

export function TopPages() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopPages = async () => {
      try {
        const response = await fetch('/api/analytics/top-pages');
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erreur lors de la récupération des données');
        }
        
        setPages(result.data || []);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        
        // Valeurs par défaut en cas d'erreur
        setPages([
          { page: '/', visitors: 0, pageviews: 0, bounceRate: '0%' },
          { page: '/a-propos', visitors: 0, pageviews: 0, bounceRate: '0%' },
          { page: '/services', visitors: 0, pageviews: 0, bounceRate: '0%' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopPages();
    
    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(fetchTopPages, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Page</TableHead>
            <TableHead className="text-right">Visiteurs</TableHead>
            <TableHead className="text-right">Pages vues</TableHead>
            <TableHead className="text-right">Taux de rebond</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.length > 0 ? (
            pages.map((page) => (
              <TableRow key={page.page}>
                <TableCell className="font-medium">{page.page}</TableCell>
                <TableCell className="text-right">{page.visitors.toLocaleString()}</TableCell>
                <TableCell className="text-right">{page.pageviews.toLocaleString()}</TableCell>
                <TableCell className="text-right">{page.bounceRate}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                Aucune donnée disponible
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
