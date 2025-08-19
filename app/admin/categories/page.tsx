'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/categories/data-table'
import { columns } from '@/components/admin/categories/columns'
import { AlertCircle, Plus, Loader2 } from 'lucide-react'

type Category = {
  id: string
  name: string
  description: string | null
  icon: string | null
  createdAt: Date
  updatedAt: Date
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching categories...')
      
      const response = await fetch('/api/admin/categories', {
        method: 'GET',
        credentials: 'include', // Inclure les cookies de session
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store' // Désactiver le cache pour cette requête
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        let errorText = 'Erreur inconnue';
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        console.error('Error response:', { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Échec du chargement des catégories (${response.status}): ${errorText}`);
      }
      
      const data = await response.json()
      console.log('Categories data:', data)
      
      // Convertir les chaînes de date en objets Date
      const categoriesWithDateObjects = data.map((category: any) => ({
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt)
      }));
      
      console.log('Categories with date objects:', categoriesWithDateObjects);
      setCategories(categoriesWithDateObjects)
    } catch (err) {
      console.error('Error in fetchCategories:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur lors du chargement des catégories
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={fetchCategories}
                  className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des catégories</h1>
          <p className="text-muted-foreground">
            Créez et gérez les catégories de projets
          </p>
        </div>
        <Button onClick={() => router.push('/admin/categories/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={categories} 
            meta={{
              refetchData: fetchCategories
            }} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
