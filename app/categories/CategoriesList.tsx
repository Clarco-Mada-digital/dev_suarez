'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  _count?: {
    projects: number;
  };
}

interface CategoriesListProps {
  categories: Category[];
  searchTerm?: string;
}

export function CategoriesList({ categories, searchTerm = '' }: CategoriesListProps) {
  const filteredCategories = searchTerm 
    ? categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : categories;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredCategories.map((category) => (
        <Link key={category.id} href={`/projects?category=${category.id}`} className="block h-full">
          <Card className="h-full transition-all hover:shadow-lg hover:border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-4">
                {category.icon && (
                  <div className="p-2 bg-muted rounded-lg">
                    <Image 
                      src={category.icon} 
                      alt={category.name} 
                      width={40} 
                      height={40}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                )}
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{category.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {category._count?.projects || 0} {category._count?.projects === 1 ? 'projet' : 'projets'}
                </span>
                <span className="text-primary flex items-center">
                  Voir les projets <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
