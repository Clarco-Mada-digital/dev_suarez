import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { ProjectBidForm } from '@/components/projects/ProjectBidForm';
import { prisma } from '@/lib/prisma';
import { HeroSection } from '@/components/HeroSection';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { userId } = auth();
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
          freelancerId: userId || '',
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
          
          {/* Colonne de droite - Détails et formulaire de candidature */}
          <div className="space-y-6">
            {/* Détails du projet */}
            <Card>
              <CardHeader>
                <CardTitle>Détails du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                  <p className="text-lg font-semibold">{project.budget} €</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date limite</h3>
                  <p>{format(new Date(project.deadline), 'PPP', { locale: fr })}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {project.client.image ? (
                      <img
                        src={project.client.image}
                        alt={project.client.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm">{project.client.name.charAt(0)}</span>
                      </div>
                    )}
                    <span>{project.client.name}</span>
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
                  {hasBid ? (
                    <div className="text-center py-4">
                      <p className="text-green-600 font-medium mb-2">Vous avez déjà postulé à ce projet</p>
                      <Button variant="outline" className="w-full" disabled>
                        Candidature envoyée
                      </Button>
                    </div>
                  ) : (
                    <ProjectBidForm projectId={project.id} />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
