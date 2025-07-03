import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('API: Début de la récupération des catégories');
  
  try {
    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('API: Connexion à la base de données établie');
    
    const categories = await prisma.projectCategory.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`API: ${categories.length} catégories trouvées`);
    return NextResponse.json(categories);
    
  } catch (error) {
    console.error('API: Erreur lors de la récupération des catégories', error);
    
    // Vérifier si l'erreur provient de Prisma
    if (error.code) {
      console.error('Code d\'erreur Prisma:', error.code);
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des catégories',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
