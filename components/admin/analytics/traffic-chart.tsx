'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface TrafficData {
  name: string;
  value: number;
}

export function TrafficChart() {
  const [data, setData] = useState<TrafficData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await fetch('/api/analytics/traffic-sources');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de trafic');
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les données de trafic');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrafficData();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  if (error || !data.length) {
    return (
      <div className="h-[250px] flex items-center justify-center text-red-500">
        {error || 'Aucune donnée de trafic disponible'}
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Sources de trafic</h3>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                `${value} visites${props?.payload?.percent ? ` (${(props.payload.percent * 100).toFixed(1)}%)` : ''}`,
                name
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
