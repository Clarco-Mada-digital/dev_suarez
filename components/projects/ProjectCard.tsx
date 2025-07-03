import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: Date;
    status: string;
    createdAt: Date;
    category: {
      id: string;
      name: string;
    };
    client: {
      id: string;
      name: string;
      image: string | null;
    };
    skills: Array<{
      id: string;
      name: string;
    }>;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.title}
            </Link>
          </CardTitle>
          <Badge variant="outline" className="whitespace-nowrap">
            {project.category.name}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Publié le {format(new Date(project.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
          <span>•</span>
          <span>Budget: {project.budget} €</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {project.description}
        </p>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Compétences recherchées :</div>
          <div className="flex flex-wrap gap-2">
            {project.skills.length > 0 ? (
              project.skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Aucune compétence spécifiée</span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          <div>Échéance: {format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr })}</div>
          <div className="text-xs">Publié par {project.client.name}</div>
        </div>
        <Button asChild size="sm">
          <Link href={`/projects/${project.id}`}>Voir l'offre</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
