'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Users, Briefcase, Tag, FileText, ArrowUpRight, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/admin/users/data-table';
import { columns } from '@/components/admin/users/columns';

// Données de démonstration - À remplacer par des appels API
const stats = [
  { name: 'Utilisateurs totaux', value: '2,345', change: '+12.1%', changeType: 'positive' },
  { name: 'Nouveaux utilisateurs (30j)', value: '256', change: '+5.4%', changeType: 'positive' },
  { name: 'Projets actifs', value: '189', change: '-2.3%', changeType: 'negative' },
  { name: 'Revenus (30j)', value: '€12,450', change: '+18.2%', changeType: 'positive' },
];

const recentActivity = [
  { id: 1, user: 'John Doe', action: 'a créé un nouveau projet', time: '2 min', project: 'Site e-commerce' },
  { id: 2, user: 'Jane Smith', action: 'a mis à jour son profil', time: '10 min', project: '' },
  { id: 3, user: 'Alex Johnson', action: 'a soumis une proposition', time: '25 min', project: 'Application mobile' },
  { id: 4, user: 'Sarah Wilson', action: 'a terminé un projet', time: '1h', project: 'Refonte de site web' },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchUsers();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Aperçu des activités et des statistiques de la plateforme
          </p>
        </div>
        <Button onClick={() => router.push('/admin/settings')} variant="outline">
          Paramètres
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                {stat.name.includes('Utilisateur') ? (
                  <Users className="h-4 w-4" />
                ) : stat.name.includes('Projet') ? (
                  <Briefcase className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>
                  Les dernières activités sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.user}{' '}
                          <span className="text-muted-foreground">
                            {activity.action}
                            {activity.project && (
                              <span className="font-semibold"> {activity.project}</span>
                            )}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Il y a {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Statut des projets</CardTitle>
                <CardDescription>
                  Répartition des projets par statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'En cours', value: 45, color: 'bg-blue-500' },
                    { name: 'Terminé', value: 30, color: 'bg-green-500' },
                    { name: 'En attente', value: 15, color: 'bg-yellow-500' },
                    { name: 'Annulé', value: 10, color: 'bg-red-500' },
                  ].map((status) => (
                    <div key={status.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{status.name}</span>
                        <span className="font-medium">{status.value}%</span>
                      </div>
                      <Progress value={status.value} className="h-2" indicatorClassName={status.color} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Utilisateurs</CardTitle>
                  <CardDescription>
                    Gérer les utilisateurs de la plateforme
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/admin/users/new')}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un utilisateur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={users} onUserUpdated={fetchUsers} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports</CardTitle>
              <CardDescription>
                Téléchargez des rapports sur l'activité de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Rapport des utilisateurs', description: 'Liste complète des utilisateurs avec leurs activités', icon: Users },
                { title: 'Rapport des projets', description: 'Détails de tous les projets et leur statut', icon: Briefcase },
                { title: 'Rapport financier', description: 'Revenus et transactions du mois en cours', icon: FileText },
              ].map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <report.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{report.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      Télécharger <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
