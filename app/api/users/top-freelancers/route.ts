import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Types pour les offres (bids)
interface Bid {
  amount: number | null;
  status: string;
  project?: {
    title: string;
    skills: Array<{ name: string }>;
  };
}

// Type pour le freelance formaté
interface FormattedFreelancer {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  hourlyRate: number;
  skills: string[];
  completedProjects: number;
  rating: number;
}

export async function GET() {
  console.log('Début de la récupération des freelancers');
  
  try {
    // Récupérer les freelancers depuis la base de données
    const freelancers = await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
      },
      include: {
        profile: true, // Inclure le profil utilisateur
        bidsAsFreelancer: {
          where: {
            status: 'ACCEPTED',
          },
          include: {
            project: {
              select: {
                category: {
                  select: {
                    name: true,
                  },
                },
                skills: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transformer les données
    const formattedFreelancers = freelancers.map((user) => {
      // Utiliser les données du profil si disponibles
      const profile = user.profile;

      // Calculer le taux horaire moyen (si non défini dans le profil)
      const hourlyRate = profile?.hourlyRate || user.bidsAsFreelancer.reduce((acc, bid) => acc + (bid.amount || 0), 0) / user.bidsAsFreelancer.length || 0;

      // Extraire les compétences (depuis le profil ou les projets)
      const skills = profile?.skills?.split(', ').map(s => s.trim()) || Array.from(new Set(
        user.bidsAsFreelancer
          .flatMap(bid => bid.project?.skills || [])
          .map(skill => skill.name)
      ));

      // Calculer le nombre de projets terminés
      const completedProjects = user.bidsAsFreelancer.length;

      // Utiliser la note du profil ou simuler
      const rating = profile?.rating || Math.min(5, (hourlyRate / 100) * 5);

      return {
        id: user.id,
        name: user.name || 'Freelancer',
        email: user.email || '',
        image: user.image || '/placeholder-user.png',
        role: user.role || 'FREELANCER',
        hourlyRate,
        skills,
        completedProjects,
        rating,
        jobTitle: profile?.jobTitle || 'Freelance',
        availability: profile?.availability || false,
        location: profile?.location || 'Non spécifié',
      };
    });

    // Trier les freelancers par nombre de projets terminés
    const sortedFreelancers = formattedFreelancers.sort((a, b) => b.completedProjects - a.completedProjects);

    return NextResponse.json(sortedFreelancers);
  } catch (error) {
    console.error('Erreur lors de la récupération des freelancers:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Erreur lors de la récupération des freelancers',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
