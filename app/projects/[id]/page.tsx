import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { HeroSection } from '@/components/HeroSection';
import Image from 'next/image';
import { ProjectBidForm } from '@/components/projects/ProjectBidForm';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/sign-in');
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      skills: true,
      bids: {
        where: {
          freelancerId: userId,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const hasBid = project.bids.length > 0;
  const isClient = userId === project.clientId;

  return (
    <div className="flex flex-col">
      <HeroSection 
        title={project.title}
        description={`Publié par ${project.client.name} • ${format(new Date(project.createdAt), 'd MMMM yyyy', { locale: fr })}`}
        className="py-16"
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Colonne de gauche - Description et détails */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête avec titre et métadonnées */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <Badge variant="outline" className="text-sm">
                  {project.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Publié le {format(new Date(project.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                <span>•</span>
                <span>Budget: {project.budget} €</span>
                <span>•</span>
                <span>Catégorie: {project.category.name}</span>
              </div>
            </div>
            
            {/* Description du projet */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Description du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{project.description}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Compétences requises */}
            <Card>
              <CardHeader>
                <CardTitle>Compétences requises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.length > 0 ? (
                    project.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Aucune compétence spécifiée</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Colonne de droite - Actions et détails */}
          <div className="space-y-6">
            {/* Carte Actions */}
            {isClient && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button asChild className="w-full">
                      <a href={`/projects/${project.id}/edit`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Modifier le projet
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Carte Détails du projet */}
            <Card>
              <CardHeader>
                <CardTitle>Détails du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="font-medium">{project.budget} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date limite</span>
                    <span className="font-medium">
                      {format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Statut</span>
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t mt-2">
                    <span className="text-sm text-muted-foreground">Client</span>
                    <div className="flex items-center gap-2">
                      {project.client?.image ? (
                        <div className="relative h-6 w-6 rounded-full overflow-hidden">
                          <Image
                            src={project.client.image}
                            alt={project.client?.name || 'Client'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs">
                            {project.client?.name?.charAt(0).toUpperCase() || 'C'}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {project.client?.name || 'Client'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Formulaire de candidature */}
            {userId && !isClient && project.status === 'OPEN' && (
              <Card>
                <CardHeader>
                  <CardTitle>Postuler à ce projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectBidForm projectId={project.id} hasBid={hasBid} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
