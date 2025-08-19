import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('API: Début de la récupération des catégories');
  
  try {
    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('API: Connexion à la base de données établie');
    
    // Récupérer les catégories avec le nombre de projets
    const categories = await prisma.projectCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        _count: {
          select: { projects: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`API: ${categories.length} catégories trouvées`);
    
    // Créer une réponse avec les en-têtes appropriés
    const response = new NextResponse(JSON.stringify(categories), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      },
    });
    
    return response;
    
  } catch (error) {
    console.error('API: Erreur lors de la récupération des catégories', error);
    
    let errorMessage = 'Une erreur est survenue';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Gestion des erreurs spécifiques à Prisma
      if ('code' in error) {
        console.error('Code d\'erreur Prisma:', (error as { code: string }).code);
        
        if ((error as { code: string }).code === 'P2021') {
          // La table n'existe pas
          errorMessage = 'La table des catégories est vide ou n\'existe pas';
          statusCode = 404;
        } else if ((error as { code: string }).code === 'P1001') {
          // Impossible de se connecter à la base de données
          errorMessage = 'Impossible de se connecter à la base de données';
          statusCode = 503;
        }
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des catégories',
        message: errorMessage
      },
      { status: statusCode }
    );
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}
