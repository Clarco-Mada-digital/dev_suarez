'use client';

import { useRouter } from 'next/navigation';
import { User, Briefcase, Mail, MapPin, Clock, Globe, Award, Code, DollarSign, CalendarCheck, Phone, Star } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RequestQuoteSheet from '@/components/quotes/RequestQuoteSheet';
import RateFreelancerPanel from '@/components/projects/RateFreelancerPanel';

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
  createdAt: Date;
  profile: {
    id: string;
    bio: string | null;
    location: string | null;
    website: string | null;
    jobTitle: string | null;
    company: string | null;
    phoneNumber: string | null;
    skills: string | null;
    languages: string | null;
    awards: string | null;
    availability: boolean;
    rating: number | null;
    ratingCount?: number;
    hourlyRate: number | null;
    completedProjectsCount?: number;
  } | null;
  projectsAsClient: Array<{ id: string; title: string; description: string; tags: string[] }>;
  acceptedBidsAsFreelancer: Array<{ id: string; proposal: string; projectTitle: string }>;
}

interface ProfileDisplayProps {
  profile: ProfileData;
  isCurrentUser: boolean;
}

export default function ProfileDisplay({ profile, isCurrentUser }: ProfileDisplayProps) {
  const router = useRouter();

  const memberSince = profile.createdAt ? format(new Date(profile.createdAt), 'yyyy', { locale: fr }) : 'N/A';
  const skillsArray = profile.profile?.skills ? profile.profile.skills.split(', ').map(s => s.trim()) : [];
  const languagesArray = profile.profile?.languages ? profile.profile.languages.split(', ').map(s => s.trim()) : [];
  const awardsArray = profile.profile?.awards ? profile.profile.awards.split(', ').map(s => s.trim()) : [];
  const hasFreelancerProjects = profile.role === 'FREELANCER' && profile.acceptedBidsAsFreelancer.length > 0;
  const hasClientProjects = profile.role === 'CLIENT' && profile.projectsAsClient.length > 0;
  const hasLeftContent = hasFreelancerProjects || hasClientProjects;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Bannière de profil */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-48 w-full"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* En-tête du profil */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="px-6 py-8 sm:px-10">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex-shrink-0 -mt-20 sm:mb-0 mb-4">
                  <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 overflow-hidden relative">
                    {profile.image ? (
                      <Image src={profile.image} alt={profile.name || 'User'} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-600 text-4xl font-bold text-gray-400 dark:text-gray-300">
                        {profile.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="sm:ml-8 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {profile.name || 'Utilisateur'}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                        {profile.profile?.jobTitle || profile.role}
                      </p>
                    </div>
                    {isCurrentUser ? (
                      <Button
                        onClick={() => router.push('/profile')}
                        className="mt-4 sm:mt-0"
                      >
                        Modifier le profil
                      </Button>
                    ) : (
                      profile.role === 'FREELANCER' && (
                        <RequestQuoteSheet
                          freelancerId={profile.id}
                          freelancerName={profile.name}
                          triggerClassName="mt-4 sm:mt-0"
                        />
                      )
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    {profile.profile?.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profile.profile.location}
                      </div>
                    )}
                    {profile.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {profile.email}
                      </div>
                    )}
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Membre depuis {memberSince}
                    </div>
                  </div>
                </div>
              </div>
              
              {profile.profile?.bio && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">À propos</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {profile.profile.bio}
                  </p>
                </div>
              )}
              
              {skillsArray.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsArray.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche */}
            {hasLeftContent && (
            <div className="lg:col-span-2 space-y-8">
              {hasFreelancerProjects && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                      Projets réalisés (Offres acceptées)
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {profile.acceptedBidsAsFreelancer.map((bid) => (
                      <div key={bid.id} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {bid.projectTitle}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {bid.proposal.substring(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasClientProjects && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <Code className="h-5 w-5 mr-2 text-blue-600" />
                      Projets publiés
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {profile.projectsAsClient.map((project) => (
                      <div key={project.id} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {project.description.substring(0, 150)}...
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {project.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}
            
            {/* Colonne de droite */}
            <div className={`${hasLeftContent ? 'lg:sticky lg:top-24' : 'lg:col-span-3'} space-y-8`}>
              {/* Détails supplémentaires */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Détails
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {profile.email && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                        <p className="mt-1 text-gray-900 dark:text-white">{profile.email}</p>
                      </div>
                    )}
                    {profile.profile?.location && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Localisation</h3>
                        <p className="mt-1 text-gray-900 dark:text-white">{profile.profile.location}</p>
                      </div>
                    )}
                    {profile.profile?.phoneNumber && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</h3>
                        <p className="mt-1 text-gray-900 dark:text-white">{profile.profile.phoneNumber}</p>
                      </div>
                    )}
                    {profile.profile?.website && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Site Web</h3>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {profile.profile.website}
                          </a>
                        </p>
                      </div>
                    )}
                    {profile.profile?.hourlyRate !== null && profile.profile?.hourlyRate !== undefined && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux horaire</h3>
                        <p className="mt-1 text-gray-900 dark:text-white">{profile.profile.hourlyRate} €/h</p>
                      </div>
                    )}
                    {profile.profile?.availability !== undefined && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Disponibilité</h3>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {profile.profile.availability ? 'Disponible pour de nouveaux projets' : 'Indisponible pour le moment'}
                        </p>
                      </div>
                    )}
                    {typeof profile.profile?.rating === 'number' && profile.profile.rating > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Note moyenne</h3>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <p className="text-gray-900 dark:text-white">
                            {profile.profile.rating.toFixed(1)} / 5{typeof profile.profile?.ratingCount === 'number' ? ` (${profile.profile.ratingCount} votes)` : ''}
                          </p>
                        </div>
                      </div>
                    )}
                    {typeof profile.profile?.completedProjectsCount === 'number' && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Projets complétés</h3>
                        <p className="mt-1 text-gray-900 dark:text-white">{profile.profile.completedProjectsCount}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notation depuis le profil (card dynamique gérée dans RateFreelancerPanel) */}
              {!isCurrentUser && profile.role === 'FREELANCER' && (
                <RateFreelancerPanel freelancerId={profile.id} />
              )}
              
              {languagesArray.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-blue-600" />
                      Langues
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {languagesArray.map((lang, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white mb-1">
                            <span>{lang}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {awardsArray.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <Award className="h-5 w-5 mr-2 text-blue-600" />
                      Récompenses
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {awardsArray.map((award, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white mb-1">
                            <span>{award}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}