import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/freelancers/[id]/rateable-projects
// Returns completed projects between current client and freelancer [id] that are not yet rated (freelancerRating is null)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return new NextResponse(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const freelancerId = params.id;

    const projects = await prisma.project.findMany({
      where: {
        clientId: currentUserId,
        assignedFreelancerId: freelancerId,
        status: 'COMPLETED',
        freelancerRating: null,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('[GET /api/freelancers/:id/rateable-projects] Error:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
