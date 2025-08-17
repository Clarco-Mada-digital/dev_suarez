import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/user/user-profile';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Récupère les projets du client connecté
  const projects = await prisma.project.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      bids: true,
      skills: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>
      <UserProfile />

      <div className="mt-10 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Mes projets</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Aucun projet pour le moment.
                <Link href="/projects/new" className="ml-2 text-primary underline">
                  Créer un projet
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {projects.map((p) => (
                  <li key={p.id} className="py-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start">
                    <div className="md:col-span-8">
                      <div className="flex items-center gap-2">
                        <Link href={`/projects/${p.id}`} className="font-medium hover:underline">
                          {p.title}
                        </Link>
                        <span className="text-xs rounded px-2 py-0.5 bg-secondary text-secondary-foreground">
                          {p.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Catégorie: {p.category?.name || '-'} • Offres: {p.bids.length}
                      </div>
                    </div>
                    <div className="md:col-span-4 flex md:justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/projects/${p.id}`}>Voir</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/projects/${p.id}/edit`}>Gérer</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}