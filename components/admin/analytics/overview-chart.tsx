'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  date: string;
  visitors: number;
  pageViews: number;
  users: number;
}

interface ApiResponse {
  data: AnalyticsData[];
  success: boolean;
  error?: string;
}

export function OverviewChart() {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching overview data...');
        const response = await fetch('/api/analytics/overview');
        const result: ApiResponse = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erreur lors de la récupération des données');
        }
        
        console.log('Data received:', result.data);
        setData(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error('Erreur détaillée:', err);
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // Formater les données pour le graphique
  const chartData = (data || []).map(item => ({
    name: item.date ? new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : '',
    visits: item.visitors || 0,
    pageviews: item.pageViews || 0,
    users: item.users || 0
  }));
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="visits" 
            name="Visites"
            stroke="#8884d8" 
            activeDot={{ r: 6 }} 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="pageviews" 
            name="Pages vues"
            stroke="#82ca9d" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="users" 
            name="Utilisateurs"
            stroke="#ffc658" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
