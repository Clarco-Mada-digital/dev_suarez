'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Eye, Clock, BarChart2 } from 'lucide-react';

interface StatsData {
  totalVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

// Valeurs par défaut pour éviter les erreurs
const defaultStats: StatsData = {
  totalVisitors: 0,
  totalPageViews: 0,
  avgSessionDuration: 0,
  bounceRate: 0
};

export function RealTimeStats() {
  const [stats, setStats] = useState<StatsData>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/stats');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des statistiques');
        }
        const data = await response.json();
        setStats({
          totalVisitors: data.totalVisitors || 0,
          totalPageViews: data.totalPageViews || 0,
          avgSessionDuration: data.avgSessionDuration || 0,
          bounceRate: data.bounceRate || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Définir des valeurs par défaut en cas d'erreur
        setStats({
          totalVisitors: 0,
          totalPageViews: 0,
          avgSessionDuration: 0,
          bounceRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch initial data
    fetchStats();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const statsData = [
    {
      title: 'Visiteurs uniques',
      value: stats?.totalVisitors ? stats.totalVisitors.toLocaleString() : '0',
      icon: Users,
      description: 'Visiteurs uniques sur 30 jours',
    },
    {
      title: 'Pages vues',
      value: stats?.totalPageViews ? stats.totalPageViews.toLocaleString() : '0',
      icon: Eye,
      description: 'Total des pages vues',
    },
    {
      title: 'Durée moyenne',
      value: stats?.avgSessionDuration !== undefined ? formatDuration(stats.avgSessionDuration) : '0s',
      icon: Clock,
      description: 'Durée moyenne des sessions',
    },
    {
      title: 'Taux de rebond',
      value: stats?.bounceRate !== undefined ? `${Math.round(stats.bounceRate * 100)}%` : '0%',
      icon: BarChart2,
      description: 'Pourcentage de sessions à une page',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
