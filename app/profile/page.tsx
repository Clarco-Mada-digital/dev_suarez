import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/components/user/user-profile';
import { FileText } from 'lucide-react';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Récupère les projets du client connecté et les devis pour les freelances
  const [projects, quotes] = await Promise.all([
    prisma.project.findMany({
      where: { clientId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        bids: true,
        skills: true,
      },
    }),
    // Récupère les devis reçus pour les freelances
    session.user.role === 'FREELANCER' 
      ? prisma.quoteRequest.findMany({
          where: { freelancerId: session.user.id },
          orderBy: { createdAt: 'desc' },
          include: {
            client: {
              select: { 
                name: true, 
                email: true, 
                image: true 
              }
            },
            freelancer: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        })
      : []
  ]);

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>
      <UserProfile />

      <div className="mt-10 space-y-6">
        {session.user.role === 'FREELANCER' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mes devis
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/quotes">Voir tout</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Aucun devis pour le moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {quotes.slice(0, 3).map((quote) => (
                    <div key={quote.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{quote.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Client: {quote.client.name}
                          </p>
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Budget:</span>{' '}
                            {quote.budgetMin && quote.budgetMax 
                              ? `${quote.budgetMin}€ - ${quote.budgetMax}€`
                              : 'Non spécifié'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                          <Badge 
                            variant={
                              quote.status === 'PENDING' ? 'outline' : 
                              quote.status === 'ACCEPTED' ? 'default' : 'destructive'
                            }
                            className="mt-1"
                          >
                            {quote.status === 'PENDING' ? 'En attente' : 
                             quote.status === 'ACCEPTED' ? 'Accepté' : 'Refusé'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="link" size="sm" className="mt-2 p-0 h-auto" asChild>
                        <Link href={`/quotes#${quote.id}`}>
                          Voir les détails →
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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