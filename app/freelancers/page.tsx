'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Briefcase, ArrowUp, ArrowDown, Search, Filter, MapPin, Star, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getFreelancers, type Freelancer } from '@/services/freelancerService';

// Chargement dynamique du composant CardUser avec désactivation du SSR
const CardUser = dynamic(() => import('@/components/CardUser'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse"></div>
});

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minHourlyRate, setMinHourlyRate] = useState<number | null>(null);
  const [maxHourlyRate, setMaxHourlyRate] = useState<number | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'hourlyRate' | 'completedProjects'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Effet pour filtrer et trier les freelances
  useEffect(() => {
    if (isLoading) return;
    
    let result = [...freelancers];
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(freelancer => 
        freelancer.name.toLowerCase().includes(query) ||
        freelancer.jobTitle.toLowerCase().includes(query) ||
        freelancer.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }
    
    // Filtre par catégories
    if (selectedCategories.length > 0) {
      result = result.filter(freelancer => 
        selectedCategories.some(category => 
          freelancer.jobTitle.toLowerCase().includes(category.toLowerCase()) ||
          freelancer.skills.some(skill => 
            skill.toLowerCase().includes(category.toLowerCase())
          )
        )
      );
    }
    
    // Filtre par taux horaire
    if (minHourlyRate !== null) {
      result = result.filter(freelancer => 
        freelancer.hourlyRate && freelancer.hourlyRate >= minHourlyRate
      );
    }
    
    if (maxHourlyRate !== null) {
      result = result.filter(freelancer => 
        freelancer.hourlyRate && freelancer.hourlyRate <= maxHourlyRate
      );
    }
    
    // Filtre par disponibilité
    if (availabilityFilter !== null) {
      result = result.filter(freelancer => freelancer.availability === availabilityFilter);
    }
    
    // Tri
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'rating') {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        comparison = ratingA - ratingB;
      } else if (sortBy === 'hourlyRate') {
        const rateA = a.hourlyRate || 0;
        const rateB = b.hourlyRate || 0;
        comparison = rateA - rateB;
      } else if (sortBy === 'completedProjects') {
        const projectsA = a.completedProjects || 0;
        const projectsB = b.completedProjects || 0;
        comparison = projectsA - projectsB;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredFreelancers(result);
  }, [freelancers, searchQuery, selectedCategories, minHourlyRate, maxHourlyRate, availabilityFilter, sortBy, sortOrder, isLoading]);

  // Chargement initial des freelances
  useEffect(() => {
    const loadFreelancers = async () => {
      try {
        const response = await fetch('/api/freelancers');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des freelances');
        }
        const data = await response.json();
        setFreelancers(data);
        setFilteredFreelancers(data);
      } catch (err) {
        console.error('Erreur lors du chargement des freelances:', err);
        setError('Impossible de charger les freelances. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFreelancers();
  }, []);

  const categories = [
    "Développement Web",
    "Design Graphique",
    "Rédaction",
    "Marketing Digital",
    "Montage Vidéo",
    "Traduction",
    "Conseil en Entreprise",
  ];

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Trouvez le freelance parfait</h1>
          <div className="w-64 h-6 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="flex justify-center gap-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-80 h-96 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Erreur</h1>
          <p className="text-red-500 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Trouvez le freelance parfait</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Découvrez des professionnels qualifiés pour mener à bien vos projets
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar des filtres */}
        <div className="w-full lg:w-1/4">
          <Card className="p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filtres</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories([]);
                  setMinHourlyRate(null);
                  setMaxHourlyRate(null);
                  setAvailabilityFilter(null);
                }}
              >
                Réinitialiser
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Barre de recherche */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Mots-clés, compétences..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtre par catégorie */}
              <div>
                <h3 className="font-medium mb-3">Compétences</h3>
                <div className="space-y-2">
                  {['Développement', 'Design', 'Marketing', 'Rédaction', 'Traduction'].map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cat-${category}`}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(cat => cat !== category));
                          }
                        }}
                      />
                      <label htmlFor={`cat-${category}`} className="ml-2 text-sm text-gray-700">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Liste des freelances */}
        <div className="flex-1">
          {/* En-tête avec compteur et tri */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="text-muted-foreground">
              {filteredFreelancers.length} {filteredFreelancers.length > 1 ? 'freelances trouvés' : 'freelance trouvé'}
            </div>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm text-muted-foreground">Trier par :</span>
              <Select 
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'rating' | 'hourlyRate' | 'completedProjects')}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Meilleure note</SelectItem>
                  <SelectItem value="hourlyRate">Taux horaire</SelectItem>
                  <SelectItem value="completedProjects">Projets réalisés</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="ml-2"
              >
                {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Grille des freelances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredFreelancers.length > 0 ? (
              filteredFreelancers.map((freelancer) => (
                <CardUser
                  key={freelancer.id}
                  id={freelancer.id}
                  name={freelancer.name}
                  jobTitle={freelancer.jobTitle}
                  skills={freelancer.skills}
                  avatarUrl={freelancer.avatarUrl}
                  availability={freelancer.availability}
                  rating={freelancer.rating}
                  ratingCount={freelancer.ratingCount}
                  hourlyRate={freelancer.hourlyRate}
                  location={freelancer.location}
                  completedProjects={freelancer.completedProjects}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucun freelance trouvé</h3>
                <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
