import { MedalIcon, StarIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import type { CardUserProps } from '@/types';

type SkillType = string | { name: string };

const CardUser: React.FC<CardUserProps> = ({
  id,
  name,
  jobTitle = '',
  skills = [],
  avatarUrl,
  availability,
  rating = 0,
  ratingCount,
  hourlyRate,
  location,
  completedProjects,
}) => {
  const truncatedBio = "Développeur passionné avec de l'expérience dans les technologies modernes...";
  const completedProjectsCount = completedProjects ?? 0;

  return (
    <div className="group relative w-full bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* En-tête avec image de profil et statut */}
      <div className="relative w-full h-64 overflow-hidden">
        {avatarUrl ? (
          <>
            <Image 
              src={avatarUrl} 
              alt={`Photo de profil de ${name}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              onError={(e) => {
                console.error(`Failed to load image: ${avatarUrl}`, e);
                // Remplacer par un placeholder en cas d'erreur
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/placeholder-user.png';
              }}
              onLoad={() => console.log(`Image loaded: ${avatarUrl}`)}
            />
            <div className="absolute inset-0 border border-gray-200 rounded-t-xl pointer-events-none"></div>
          </>
        ) : (
          <div className="w-80 h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-4xl font-bold">
              {name ? name.split(' ').map(n => n[0] || '').join('') : 'U'}
            </span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded-full text-xs flex items-center">
          <span className={`w-2 h-2 rounded-full mr-1 ${availability ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          {availability ? 'Disponible' : 'Indisponible'}
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/profile/${id || ''}`} className="hover:underline">
            <h3 className="text-lg font-semibold text-foreground ellipsis">{name || 'Utilisateur sans nom'}</h3>
            <p className="text-sm text-muted-foreground">{jobTitle || 'Freelance'}</p>
          </Link>
          
          {(rating > 0) && ((ratingCount ?? 0) > 0) && (
            <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
              <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-sm font-medium">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Compétences */}
        <div className="my-3 flex flex-wrap gap-1">
          {Array.isArray(skills) && skills.length > 0 ? (
            <>
              {skills.slice(0, 4).map((skill, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {typeof skill === 'string' ? skill : skill.name || 'Compétence'}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{skills.length - 4} autres
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Aucune compétence renseignée</span>
          )}
        </div>

        {/* Localisation et tarif */}
        <div className="flex justify-between items-center text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
          {location && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </div>
          )}
          {hourlyRate && (
            <span className="font-medium text-foreground">{hourlyRate}€/h</span>
          )}
        </div>

        {/* Pied de carte */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center text-sm">
            <MedalIcon className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-muted-foreground">{completedProjectsCount} projets</span>
          </div>
          <Link 
            href={`/profile/${id || ''}`}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Voir le profil →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardUser;
