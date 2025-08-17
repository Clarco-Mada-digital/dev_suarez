import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// ... (garder les mêmes types d'interface)

export async function GET(request: NextRequest) {
  console.log('Début de la récupération des freelancers');

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;
  
  try {
    // Récupérer tous les freelancers pour le tri en mémoire
    const freelancers = await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
      },
      include: {
        profile: true,
        bidsAsFreelancer: {
          where: { status: 'ACCEPTED' },
          include: {
            project: {
              select: {
                category: { select: { name: true } },
                skills: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const totalFreelancers = freelancers.length;

    // Transformer les données
    const formattedFreelancers = freelancers.map((user) => {
      const profile = user.profile;
      const hourlyRate = profile?.hourlyRate || user.bidsAsFreelancer.reduce((acc, bid) => acc + (bid.amount || 0), 0) / (user.bidsAsFreelancer.length || 1) || 0;
      const skills = profile?.skills?.split(', ').map(s => s.trim()) || Array.from(new Set(
        user.bidsAsFreelancer
          .flatMap(bid => bid.project?.skills || [])
          .map(skill => skill.name)
      ));
      const completedProjectsCount = (profile?.completedProjectsCount ?? 0);
      const fallbackCompleted = user.bidsAsFreelancer.length;
      const effectiveCompleted = completedProjectsCount || fallbackCompleted;
      const rating = profile?.rating || Math.min(5, (effectiveCompleted / 10) * 5);

      return {
        id: user.id,
        name: user.name || 'Freelancer',
        email: user.email || '',
        image: user.image || '/placeholder-user.png',
        role: user.role || 'FREELANCER',
        hourlyRate,
        skills,
        completedProjectsCount: completedProjectsCount || fallbackCompleted,
        rating,
        ratingCount: profile?.ratingCount ?? 0,
        jobTitle: profile?.jobTitle || 'Freelance',
        availability: profile?.availability || false,
        location: profile?.location || 'Non spécifié',
      };
    });

    // Trier les freelancers par note (meilleure note en premier)
    const sortedFreelancers = formattedFreelancers.sort((a, b) => b.rating - a.rating);

    // Paginer les résultats triés
    const paginatedFreelancers = sortedFreelancers.slice(skip, skip + limit);

    return NextResponse.json({
      freelancers: paginatedFreelancers,
      total: totalFreelancers,
      page,
      limit,
    });

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
