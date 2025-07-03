import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const data = await req.json();
    const { title, description, budget, deadline, categoryId, skills } = data;

    // Vérifier que la catégorie existe
    const category = await prisma.projectCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return new NextResponse('Catégorie non trouvée', { status: 404 });
    }

    // Créer le projet
    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        deadline: new Date(deadline),
        status: 'OPEN',
        clientId: userId,
        categoryId,
        skills: {
          create: skills.map((skill: string) => ({
            name: skill,
          })),
        },
      },
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    console.error('Error creating project:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';

    const projects = await prisma.project.findMany({
      where: {
        status: 'OPEN',
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(category && { categoryId: category }),
      },
      include: {
        category: true,
        client: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        skills: true,
      },
      orderBy: sort === 'newest' ? { createdAt: 'desc' } : { budget: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
