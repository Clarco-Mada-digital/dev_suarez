import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const freelancers = await prisma.user.findMany({
      where: {
        role: { in: ['FREELANCER', 'USER'] }, // Inclure les utilisateurs avec rôle FREELANCER ou USER
      },
      take: 10, // Limite le nombre de résultats
      orderBy: {
        createdAt: 'desc', // Trie par date de création la plus récente
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bidsAsFreelancer: {
          select: {
            amount: true,
            status: true,
            project: {
              select: {
                title: true,
                skills: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
    });

    // Transformer les données pour correspondre à l'interface attendue
    const formattedFreelancers = freelancers.map(user => {
      // Extraire les compétences uniques des projets sur lesquels l'utilisateur a postulé
      const skills = Array.from(
        new Set(
          user.bidsAsFreelancer.flatMap(bid => 
            bid.project.skills.map(skill => skill.name)
          )
        )
      );
      
      // Calculer le taux horaire moyen basé sur les offres
      const bidsWithAmount = user.bidsAsFreelancer.filter(bid => bid.amount > 0);
      const hourlyRate = bidsWithAmount.length > 0
        ? bidsWithAmount.reduce((sum, bid) => sum + bid.amount, 0) / bidsWithAmount.length
        : 0;
      
      // Calculer une note basée sur les offres acceptées
      const acceptedBids = user.bidsAsFreelancer.filter(bid => bid.status === 'ACCEPTED').length;
      const rating = Math.min(5, 3 + (acceptedBids * 0.2)); // Note de base 3 + 0.2 par projet accepté
      
      return {
        id: user.id,
        name: user.name || 'Utilisateur sans nom',
        email: user.email,
        image: user.image || '/placeholder-user.png',
        role: user.role,
        jobTitle: 'Freelance', // Valeur par défaut
        skills: skills,
        availability: true, // Par défaut à true
        rating: parseFloat(rating.toFixed(1)), // Arrondir à 1 décimal
        hourlyRate: Math.round(hourlyRate),
        location: 'Non spécifié', // Valeur par défaut
      };
    });

    return NextResponse.json(formattedFreelancers);
  } catch (error) {
    console.error('Error fetching top freelancers:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
