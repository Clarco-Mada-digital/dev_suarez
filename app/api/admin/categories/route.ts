import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Fonction utilitaire pour créer une réponse CORS
function createCorsResponse(body: any, status: number = 200, request?: Request) {
  try {
    const origin = request?.headers?.get('origin') || '*';
    const response = new NextResponse(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
    
    // Ajouter les en-têtes CORS
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    response.headers.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    
    return response;
  } catch (error) {
    console.error('Error in createCorsResponse:', error);
    // En cas d'erreur, retourner une réponse basique sans CORS
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Gérer les requêtes OPTIONS pour CORS preflight
export async function OPTIONS(request: Request) {
  try {
    const origin = request.headers.get('origin') || '*';
    const response = new NextResponse(null, { status: 204 });
    
    // Définir les en-têtes CORS pour la réponse OPTIONS
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    response.headers.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    
    return response;
  } catch (error) {
    console.error('Error in OPTIONS handler:', error);
    return new NextResponse(null, { status: 500 });
  }
}

// GET /api/admin/categories - Récupérer toutes les catégories
export async function GET(request: Request) {
  try {
    console.log('=== Début de la requête GET /api/admin/categories ===');
    console.log('URL:', request.url);
    console.log('Méthode:', request.method);
    console.log('En-têtes de la requête:', Object.fromEntries(request.headers.entries()));
    
    console.log('\n=== Récupération de la session ===');
    const session = await getServerSession(authOptions);
    console.log('Session récupérée:', session ? 'Oui' : 'Non');
    console.log('Détails de la session:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error('Erreur: Aucune session trouvée');
      return createCorsResponse({ 
        error: 'Non authentifié',
        details: 'Aucune session valide trouvée. Veuillez vous connecter.'
      }, 401, request);
    }
    
    console.log('\n=== Vérification du rôle ===');
    console.log('Rôle de l\'utilisateur:', session.user?.role);
    
    if (session.user?.role !== 'ADMIN') {
      console.error(`Erreur: L'utilisateur n'est pas administrateur. Rôle: ${session.user?.role}`);
      return createCorsResponse({ 
        error: 'Accès non autorisé',
        details: 'Vous devez être administrateur pour accéder à cette ressource.'
      }, 403, request);
    }

    console.log('\n=== Récupération des catégories depuis la base de données ===');
    const categories = await prisma.projectCategory.findMany({
      orderBy: { name: 'asc' },
    });
    
    console.log('Catégories récupérées avec succès. Nombre:', categories.length);
    
    // Ne pas logger les données sensibles en production
    if (process.env.NODE_ENV === 'development') {
      console.log('Détails des catégories:', JSON.stringify(categories, null, 2));
    }

    return createCorsResponse(categories, 200, request);
  } catch (error) {
    console.error('\n=== ERREUR lors de la récupération des catégories ===');
    console.error('Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Message d\'erreur:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    
    return createCorsResponse({ 
      error: 'Erreur interne du serveur',
      details: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : String(error)
        : 'Une erreur est survenue lors du traitement de votre demande.'
    }, 500, request);
  }
}

// POST /api/admin/categories - Créer une nouvelle catégorie
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return createCorsResponse({ error: 'Non authentifié' }, 401, request)
    }
    
    if (session.user.role !== 'ADMIN') {
      return createCorsResponse({ error: 'Accès non autorisé' }, 403, request)
    }

    const body = await request.json()
    const { name, description, icon } = body

    if (!name) {
      return createCorsResponse({ error: 'Le nom est requis' }, 400, request)
    }

    // Vérifier si la catégorie existe déjà
    const existingCategory = await prisma.projectCategory.findUnique({
      where: { name },
    })

    if (existingCategory) {
      return createCorsResponse({ error: 'Une catégorie avec ce nom existe déjà' }, 400, request)
    }

    // Créer la catégorie
    const category = await prisma.projectCategory.create({
      data: {
        name,
        description: description || null,
        icon: icon || null,
      },
    });

    return createCorsResponse(category, 201, request);
  } catch (error) {
    console.error('Error creating category:', error)
    return createCorsResponse({ error: 'Erreur interne du serveur' }, 500, request)
  }
}
