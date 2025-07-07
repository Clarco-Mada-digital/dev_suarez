'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { User, Briefcase, Mail, MapPin, Clock, Globe, Award, Code } from 'lucide-react';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  bio: string;
  skills: string[];
  experience: {
    company: string;
    position: string;
    duration: string;
  }[];
  projects: {
    id: string;
    title: string;
    description: string;
    tags: string[];
  }[];
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { userId: currentUserId } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isCurrentUser = currentUserId === params.id;

  // Simuler le chargement des données
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Remplacez cette partie par un appel API réel
        const mockProfile: ProfileData = {
          id: params.id,
          name: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          role: 'Développeur Full Stack',
          location: 'Paris, France',
          bio: 'Développeur passionné avec plus de 5 ans d\'expérience dans le développement web et mobile. Toujours à la recherche de nouveaux défis techniques.',
          skills: ['React', 'Node.js', 'TypeScript', 'Next.js', 'GraphQL', 'Docker'],
          experience: [
            {
              company: 'TechCorp',
              position: 'Développeur Senior',
              duration: '2020 - Présent'
            },
            {
              company: 'WebAgency',
              position: 'Développeur Frontend',
              duration: '2018 - 2020'
            }
          ],
          projects: [
            {
              id: '1',
              title: 'Plateforme E-commerce',
              description: 'Développement d\'une plateforme e-commerce complète avec système de paiement et gestion des stocks.',
              tags: ['React', 'Node.js', 'MongoDB']
            },
            {
              id: '2',
              title: 'Application Mobile',
              description: 'Application mobile de suivi d\'activité physique avec synchronisation en temps réel.',
              tags: ['React Native', 'Firebase']
            }
          ]
        };
        
        setProfile(mockProfile);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Profil non trouvé</h2>
          <p className="text-gray-600 dark:text-gray-300">Désolé, nous n'avons pas pu charger ce profil.</p>
        </div>
      </div>
    );
  }

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
                  <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 overflow-hidden">
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-600 text-4xl font-bold text-gray-400 dark:text-gray-300">
                      {profile.name.charAt(0)}
                    </div>
                  </div>
                </div>
                
                <div className="sm:ml-8 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {profile.name}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                        {profile.role}
                      </p>
                    </div>
                    
                    {isCurrentUser && (
                      <button
                        onClick={() => router.push('/profile/edit')}
                        className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Modifier le profil
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {profile.email}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Membre depuis 2018
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">À propos</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {profile.bio}
                </p>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche */}
            <div className="lg:col-span-2 space-y-8">
              {/* Expérience professionnelle */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    Expérience
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="p-6">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {exp.position}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 mt-1">{exp.company}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Projets récents */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Code className="h-5 w-5 mr-2 text-blue-600" />
                    Projets récents
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {profile.projects.map((project) => (
                    <div key={project.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        {project.description}
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
            </div>
            
            {/* Colonne de droite */}
            <div className="space-y-8">
              {/* À propos */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    À propos
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">{profile.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Localisation</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">{profile.location}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Disponibilité</h3>
                      <p className="mt-1 text-gray-900 dark:text-white">Temps plein</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Récompenses */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-600" />
                    Récompenses
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Meilleur employé</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">TechCorp - 2022</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Langues */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Langues
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white mb-1">
                        <span>Français</span>
                        <span>Natif</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white mb-1">
                        <span>Anglais</span>
                        <span>Courant</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white mb-1">
                        <span>Espagnol</span>
                        <span>Intermédiaire</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-2/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
