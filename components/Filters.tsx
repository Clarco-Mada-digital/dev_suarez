"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Search as SearchIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

export interface FiltersProps {
  skills: string[]
  onFilterChange: (filters: {
    search: string
    skills: string[]
    availability: "all" | "available" | "unavailable"
    rating: [number, number]
  }) => void
}

export function Filters({ skills, onFilterChange }: FiltersProps) {
  const [search, setSearch] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [availability, setAvailability] = useState<"all" | "available" | "unavailable">("all")
  const [rating, setRating] = useState<[number, number]>([0, 5])
  const [showAllSkills, setShowAllSkills] = useState(false)

  // Délai pour éviter de déclencher trop de rendus pendant la saisie
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        search,
        skills: selectedSkills,
        availability,
        rating,
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [search, selectedSkills, availability, rating, onFilterChange])

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedSkills([])
    setAvailability("all")
    setRating([0, 5])
  }

  const displayedSkills = showAllSkills ? skills : skills.slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Recherche</h3>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Compétences</h3>
          {selectedSkills.length > 0 && (
            <button
              onClick={() => setSelectedSkills([])}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center"
            >
              <X className="h-3 w-3 mr-1" />
              Tout effacer
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {displayedSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`text-xs px-2 py-1 rounded-md border ${
                selectedSkills.includes(skill)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-accent border-border'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
        {skills.length > 10 && (
          <button
            onClick={() => setShowAllSkills(!showAllSkills)}
            className="text-xs text-primary hover:underline mt-1"
          >
            {showAllSkills ? 'Voir moins' : `Voir les ${skills.length - 10} compétences supplémentaires`}
          </button>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Disponibilité</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              className="h-4 w-4 text-primary"
              checked={availability === 'all'}
              onChange={() => setAvailability('all')}
            />
            <span className="text-sm">Tous les statuts</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              className="h-4 w-4 text-primary"
              checked={availability === 'available'}
              onChange={() => setAvailability('available')}
            />
            <span className="text-sm">Disponible maintenant</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              className="h-4 w-4 text-primary"
              checked={availability === 'unavailable'}
              onChange={() => setAvailability('unavailable')}
            />
            <span className="text-sm">Occupé</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Note minimale</h3>
        <div className="px-2">
          <Slider
            min={0}
            max={5}
            step={0.5}
            value={[rating[0]]}
            onValueChange={(value) => setRating([value[0], 5])}
            className="mb-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{rating[0]} étoiles</span>
            <span>5 étoiles</span>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full mt-2"
        onClick={clearFilters}
        disabled={!search && selectedSkills.length === 0 && availability === 'all' && rating[0] === 0}
      >
        <X className="h-4 w-4 mr-2" />
        Réinitialiser les filtres
      </Button>
    </div>
  )
}
