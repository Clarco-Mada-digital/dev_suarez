'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface DeviceData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FFBB28'];

export function DeviceChart() {
  const [data, setData] = useState<DeviceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour formater les données reçues de l'API
  const formatData = (apiData: any[]): DeviceData[] => {
    console.log('Données brutes de l\'API:', apiData);
    
    // Si les données sont déjà au bon format, les retourner telles quelles
    if (apiData.every(item => item.name && typeof item.value === 'number')) {
      return apiData as DeviceData[];
    }
    
    // Sinon, essayer de convertir depuis le format de l'API
    return apiData.map(item => ({
      name: item.device || item.name || 'Inconnu',
      value: typeof item.count === 'number' ? item.count : 0
    }));
  };

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await fetch('/api/analytics/devices');
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erreur lors de la récupération des données');
        }
        
        console.log('Réponse de l\'API:', result);
        const formattedData = formatData(Array.isArray(result.data) ? result.data : []);
        console.log('Données formatées:', formattedData);
        setData(formattedData);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        
        // Valeurs par défaut en cas d'erreur
        setData([
          { name: 'Mobile', value: 0 },
          { name: 'Ordinateur', value: 0 },
          { name: 'Tablette', value: 0 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeviceData();
    
    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(fetchDeviceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  if (error) {
    return (
      <div className="h-[250px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // Si pas de données ou valeurs nulles, utiliser des données par défaut
  const displayData = data.length > 0 && !data.every(item => item.value === 0) 
    ? data 
    : [
        { name: 'Mobile', value: 45 },
        { name: 'Ordinateur', value: 35 },
        { name: 'Tablette', value: 20 },
      ];
  
  console.log('Données à afficher:', displayData);
  
  // Afficher un message d'information si on utilise des données par défaut
  const showInfo = data.length === 0 || data.every(item => item.value === 0);

  return (
    <div className="h-[250px] relative">
      {showInfo ? (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-yellow-50 text-yellow-800 text-xs px-2 py-1 rounded-md z-10">
          Données de démonstration
        </div>
      ) : (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-md z-10">
          {displayData.length} types d'appareils détectés
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {displayData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}`, 'Visiteurs']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
