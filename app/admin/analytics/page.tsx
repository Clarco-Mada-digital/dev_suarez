'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart, Users, Eye, Clock, BarChart2 } from 'lucide-react';
import { OverviewChart } from '@/components/admin/analytics/overview-chart';
import { TrafficChart } from '@/components/admin/analytics/traffic-chart';
import { UserActivity } from '@/components/admin/analytics/user-activity';
import { TopPages } from '@/components/admin/analytics/top-pages';
import { DeviceChart } from '@/components/admin/analytics/device-chart';
import { RealTimeStats } from '@/components/admin/analytics/real-time-stats';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AnalyticsPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Mise à jour de la date de dernière mise à jour
    const updateLastUpdated = () => {
      setLastUpdated(format(new Date(), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr }));
    };
    
    updateLastUpdated();
    const interval = setInterval(updateLastUpdated, 60000); // Mise à jour toutes les minutes
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord analytique</h1>
            <p className="text-muted-foreground">
              Visualisez les performances et l'engagement de votre site
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Dernière mise à jour : {lastUpdated || <Skeleton className="inline-block h-4 w-40" />}
          </div>
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div className="mb-8">
        <RealTimeStats />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart className="mr-2 h-4 w-4" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="traffic">
            <LineChart className="mr-2 h-4 w-4" />
            Trafic
          </TabsTrigger>
          <TabsTrigger value="users">
            <PieChart className="mr-2 h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Aperçu des performances</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <OverviewChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Sources de trafic</CardTitle>
              </CardHeader>
              <CardContent>
                <TrafficChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Pages les plus visitées</CardTitle>
              </CardHeader>
              <CardContent>
                <TopPages />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Appareils utilisés</CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Activité des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <UserActivity />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
