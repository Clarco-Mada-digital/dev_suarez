"use client";

import { useEffect, useState } from 'react';
import CardUser from "@/components/CardUser";
import Presentation from "@/components/Presentation";
import { CardUserProps } from '@/types';
import { Skeleton } from '@/components/ui';
import { getUsersByCategory } from '@/lib/mockData';
import { formatCategoryName } from '@/lib/utils/categoryUtils';

const CategoryPage = ({ params }: { params: { categorieId: string } }) => {
  const [users, setUsers] = useState<CardUserProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simuler un chargement asynchrone
    const timer = setTimeout(() => {
      try {
        console.log('Catégorie demandée:', params.categorieId);
        const categoryUsers = getUsersByCategory(params.categorieId);
        console.log('Utilisateurs trouvés:', categoryUsers);
        setUsers(categoryUsers);
        setError(categoryUsers.length === 0 ? 'Aucun utilisateur trouvé dans cette catégorie.' : null);
      } catch (err) {
        setError('Une erreur est survenue lors du chargement des utilisateurs.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [params.categorieId]);

  return (
    <div className='min-h-[90vh] py-8'>
      <div className='container mx-auto px-4'>
        <Presentation 
          text={`Découvrez nos professionnels en ${formatCategoryName(params.categorieId).toLowerCase()}`}
        />
        <h1 className="text-3xl font-bold text-center mb-8">
          Catégorie : {formatCategoryName(params.categorieId)}
        </h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4 p-4 border rounded-lg">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {users.map((user) => (
              <CardUser key={user.id} {...user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
