'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  type: string;
  path: string;
  sessionId: string;
  userId: string | null;
  referrer: string | null;
  userAgent: string;
  timestamp: string;
  device: string;
}

export function UserActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/analytics/user-activity');
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erreur lors de la récupération des activités');
        }
        
        setActivities(result.data || []);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
    
    // Rafraîchir les données toutes les minutes
    const interval = setInterval(fetchActivities, 60000);
    return () => clearInterval(interval);
  }, []);

  const getEventTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      page_view: { label: 'Page vue', variant: 'default' },
      click: { label: 'Clic', variant: 'secondary' },
      download: { label: 'Téléchargement', variant: 'outline' },
      form_submission: { label: 'Formulaire', variant: 'destructive' },
    };
    
    const badgeInfo = typeMap[type] || { label: type, variant: 'outline' as const };
    return <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[200px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente des utilisateurs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Appareil</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Date/Heure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{getEventTypeBadge(activity.type)}</TableCell>
                    <TableCell className="font-medium">
                      <a 
                        href={activity.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {activity.path}
                      </a>
                    </TableCell>
                    <TableCell>{activity.device}</TableCell>
                    <TableCell>
                      {activity.userId ? (
                        <span className="font-mono text-sm">
                          {activity.userId.substring(0, 6)}...
                        </span>
                      ) : (
                        'Visiteur'
                      )}
                    </TableCell>
                    <TableCell>{activity.timestamp}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Aucune activité récente à afficher
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
