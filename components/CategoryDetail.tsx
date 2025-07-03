"use client"

import { useState, useMemo } from "react"
import { Filters } from "@/components/Filters"
import { FreelancerCard } from "@/components/FreelancerCard"
import { Pagination } from "@/components/Pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

export interface Skill {
  id: string
  name: string
}

export interface Freelancer {
  id: string
  name: string
  title: string
  skills: string[]
  rating: number
  location: string
  available: boolean
  image: string
  hourlyRate: number
}

export interface CategoryDetailProps {
  category: {
    id: string
    name: string
    description: string
    icon: string
    popularSkills: Skill[]
    freelancers: Freelancer[]
    pagination?: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
  }
}

export function CategoryDetail({ category }: CategoryDetailProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    skills: [] as string[],
    availability: "all" as "all" | "available" | "unavailable",
    rating: [0, 5] as [number, number],
    sort: "rating-desc" as "rating-desc" | "price-asc" | "price-desc",
  })

  // Toutes les compétences uniques pour les filtres
  const allSkills = Array.from(
    new Set(category.freelancers.flatMap((f) => f.skills))
  )

  // Filtrer et trier les freelances
  const filteredFreelancers = useMemo(() => {
    return category.freelancers
      .filter((freelancer) => {
        // Filtre par recherche
        const matchesSearch =
          filters.search === "" ||
          freelancer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          freelancer.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          freelancer.skills.some(skill => 
            skill.toLowerCase().includes(filters.search.toLowerCase())
          )

        // Filtre par compétences
        const matchesSkills =
          filters.skills.length === 0 ||
          filters.skills.every((skill) => freelancer.skills.includes(skill))

        // Filtre par disponibilité
        const matchesAvailability =
          filters.availability === "all" ||
          (filters.availability === "available" && freelancer.available) ||
          (filters.availability === "unavailable" && !freelancer.available)

        // Filtre par note
        const matchesRating =
          freelancer.rating >= filters.rating[0] &&
          freelancer.rating <= filters.rating[1]

        return (
          matchesSearch && matchesSkills && matchesAvailability && matchesRating
        )
      })
      .sort((a, b) => {
        // Trier selon l'option sélectionnée
        switch (filters.sort) {
          case "rating-desc":
            return b.rating - a.rating
          case "price-asc":
            return a.hourlyRate - b.hourlyRate
          case "price-desc":
            return b.hourlyRate - a.hourlyRate
          default:
            return 0
        }
      })
  }, [category.freelancers, filters])

  // Gestion de la pagination côté client pour les filtres
  const paginatedFreelancers = useMemo(() => {
    if (!category.pagination) return filteredFreelancers
    
    const startIndex = (category.pagination.currentPage - 1) * category.pagination.itemsPerPage
    return filteredFreelancers.slice(startIndex, startIndex + category.pagination.itemsPerPage)
  }, [filteredFreelancers, category.pagination])

  const totalFilteredPages = category.pagination 
    ? category.pagination.totalPages 
    : Math.ceil(filteredFreelancers.length / 5)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtres pour mobile */}
        <div className="md:hidden">
          <Button
            variant="outline"
            className="w-full mb-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Cacher les filtres" : "Afficher les filtres"}
          </Button>

          {showFilters && (
            <div className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Filters
                skills={allSkills}
                onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
              />
            </div>
          )}
        </div>

        {/* Filtres pour desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-medium mb-6 text-gray-900 dark:text-white">Filtres</h3>
              <Filters
                skills={allSkills}
                onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
              />
            </div>
          </div>
        </div>

        {/* Liste des freelances */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{category.name}</h1>
              <p className="text-muted-foreground dark:text-gray-400">
                {filteredFreelancers.length} freelances trouvés
                {filters.search && ` pour "${filters.search}"`}
              </p>
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={filters.sort}
                onValueChange={(value: "rating-desc" | "price-asc" | "price-desc") =>
                  setFilters({ ...filters, sort: value })
                }
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Trier par" className="text-left" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="rating-desc" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    Meilleures notes
                  </SelectItem>
                  <SelectItem value="price-asc" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    Prix croissant
                  </SelectItem>
                  <SelectItem value="price-desc" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    Prix décroissant
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {paginatedFreelancers.length > 0 ? (
              <div className="space-y-4">
                {paginatedFreelancers.map((freelancer) => (
                  <div key={freelancer.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                    <FreelancerCard freelancer={freelancer} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun résultat trouvé</h3>
                <p className="text-muted-foreground dark:text-gray-400 max-w-md mx-auto mb-6">
                  Aucun freelance ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
                </p>
                <Button
                  variant="outline"
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                  onClick={() => {
                    setFilters({
                      search: "",
                      skills: [],
                      availability: "all",
                      rating: [0, 5],
                      sort: "rating-desc",
                    })
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalFilteredPages > 1 && category.pagination && (
            <div className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={category.pagination.currentPage}
                totalPages={totalFilteredPages}
                className="mt-0"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
