'use client';

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Presentation from "@/components/Presentation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoriesList } from "./CategoriesList";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  _count?: {
    projects: number;
  };
}

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des catégories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de charger les catégories. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = searchTerm
    ? categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : categories;

  return (
    <div className='min-h-[90vh]'>
      <Presentation 
        img="/img-hero-presentation.png" 
        text="Explorez nos catégories de freelances"
        btnText="Trouver un expert"
        btnLink="#categories"
      />
      <div id="categories" className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Catégories', href: '/categories', active: true }
          ]} 
          className="mb-8"
        />
        
        <div className="py-4">
          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto mb-12 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une catégorie..."
              className="pl-10 w-full py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Erreur</h3>
              <p className="text-muted-foreground">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Réessayer
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune catégorie trouvée</h3>
              <p className="text-muted-foreground">Essayez avec d'autres termes de recherche</p>
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <>
              <CategoriesList 
                categories={filteredCategories} 
                searchTerm={searchTerm} 
              />
              
              {/* Section CTA */}
              <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Vous ne trouvez pas ce que vous cherchez ?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Notre équipe est là pour vous aider à trouver le freelance idéal pour votre projet. 
                  Contactez-nous directement pour discuter de vos besoins spécifiques.
                </p>
                <Link href="/contact">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                    Nous contacter
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
