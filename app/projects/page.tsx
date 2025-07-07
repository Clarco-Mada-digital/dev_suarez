import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { prisma } from '@/lib/prisma';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { HeroSection } from '@/components/HeroSection';
import Presentation from '@/components/Presentation';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    category?: string;
    sort?: string;
  };
}) {
  const query = searchParams?.query || '';
  const category = searchParams?.category === 'all' ? '' : searchParams?.category || '';
  const sort = searchParams?.sort || 'newest';

  // Récupérer les projets depuis la base de données
  const projects = await prisma.project.findMany({
    where: {
      status: 'OPEN',
      ...(query && {
        OR: [
          { title: { contains: query.toLowerCase() } },
          { description: { contains: query.toLowerCase() } },
        ],
      }),
      ...(category && { categoryId: category }),
    },
    include: {
      category: true,
      client: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      skills: true,
    },
    orderBy: sort === 'newest' ? { createdAt: 'desc' } : { budget: 'desc' },
  });

  // Récupérer les catégories pour le filtre
  const categories = await prisma.projectCategory.findMany();

  return (
    <div className="flex flex-col">
      {/* <HeroSection 
        title="Trouvez votre prochain projet" 
        description="Parcourez les offres et trouvez des projets qui correspondent à vos compétences"
        ctaText="Publier un projet"
        ctaLink="/projects/new"
        imageUrl="/projects-hero.png"
      /> */}
      <Presentation 
        img="/img-hero-presentation.png" 
        text="Parcourez les offres et trouvez des projets qui correspondent à vos compétences"
        btnText="Trouvez votre prochain projet"
        btnLink="/projects"
      />
      
      <div className="container mx-auto px-4 py-12">
        <form method="GET" action="/projects" className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <label htmlFor="search" className="sr-only">Rechercher des projets</label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Rechercher des projets..."
                className="pl-10"
                defaultValue={query}
                name="query"
                aria-label="Rechercher des projets"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div>
                <label htmlFor="category" className="sr-only">Catégorie</label>
                <Select name="category" defaultValue={category || 'all'}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="sort" className="sr-only">Trier par</label>
                <Select name="sort" defaultValue={sort}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Plus récents</SelectItem>
                    <SelectItem value="budget">Budget élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Appliquer</Button>
            </div>
          </div>
        </form>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
              <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Vous êtes une entreprise ?</p>
          <Button asChild>
            <Link href="/projects/new">Publier un projet</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
