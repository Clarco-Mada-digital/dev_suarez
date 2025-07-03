import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.projectCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching project categories:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, description } = data;

    if (!name) {
      return new NextResponse('Le nom de la catégorie est requis', { status: 400 });
    }

    const category = await prisma.projectCategory.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating project category:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
