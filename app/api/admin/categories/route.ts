import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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
  console.log('\n=== [GET /api/admin/categories] Début de la requête ===');
  console.log('URL:', request.url);
  console.log('Méthode:', request.method);
  
  // Vérifier si la requête est une requête d'options CORS
  if (request.method === 'OPTIONS') {
    console.log('Traitement de la requête OPTIONS (CORS preflight)');
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    console.log('\n=== [GET /api/admin/categories] Récupération de la session ===');
    const session = await auth();
    
    if (!session) {
      console.error('Erreur: Aucune session utilisateur trouvée');
      return createCorsResponse({ 
        success: false,
        error: 'Non authentifié',
        message: 'Veuillez vous connecter pour accéder à cette ressource.'
      }, 401, request);
    }

    console.log('Session utilisateur trouvée:', {
      userId: session.user?.id,
      email: session.user?.email,
      role: session.user?.role,
      expires: session.expires
    });

    // Vérification du rôle administrateur
    if (session.user?.role !== 'ADMIN') {
      console.error(`Erreur: Accès refusé. Rôle requis: ADMIN, Rôle actuel: ${session.user?.role || 'non défini'}`);
      return createCorsResponse({
        success: false,
        error: 'Accès refusé',
        message: 'Vous devez être administrateur pour accéder à cette ressource.'
      }, 403, request);
    }

    console.log('\n=== [GET /api/admin/categories] Récupération des catégories ===');
    
    // Vérifier la connexion à la base de données
    try {
      await prisma.$connect();
      console.log('Connexion à la base de données établie avec succès');
    } catch (dbError) {
      console.error('Erreur de connexion à la base de données:', dbError);
      return createCorsResponse({
        success: false,
        error: 'Erreur de base de données',
        message: 'Impossible de se connecter à la base de données.'
      }, 500, request);
    }

    // Récupérer les catégories
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
      orderBy: { name: 'asc' },
    });
    
    console.log(`\n=== [GET /api/admin/categories] ${categories.length} catégories trouvées ===`);
    
    // Log des catégories en mode développement uniquement
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
    console.log('\n=== [POST /api/admin/categories] Début de la requête ===');
    
    // Vérification de la session utilisateur
    const session = await auth();
    
    if (!session) {
      console.error('Erreur: Aucune session utilisateur trouvée');
      return createCorsResponse({ 
        success: false,
        error: 'Non authentifié',
        message: 'Veuillez vous connecter pour accéder à cette ressource.'
      }, 401, request);
    }
    
    // Vérification du rôle administrateur
    if (session.user?.role !== 'ADMIN') {
      console.error(`Erreur: Accès refusé. Rôle requis: ADMIN, Rôle actuel: ${session.user?.role || 'non défini'}`);
      return createCorsResponse({
        success: false,
        error: 'Accès refusé',
        message: 'Vous devez être administrateur pour accéder à cette ressource.'
      }, 403, request);
    }

    // Récupération et validation du corps de la requête
    let body;
    try {
      body = await request.json();
      console.log('Corps de la requête reçu:', JSON.stringify(body, null, 2));
    } catch (error) {
      console.error('Erreur lors du parsing du corps de la requête:', error);
      return createCorsResponse({ 
        success: false,
        error: 'Format de requête invalide',
        message: 'Le corps de la requête doit être au format JSON valide.'
      }, 400, request);
    }
    
    const { name, description, icon } = body;

    // Validation des champs obligatoires
    if (!name || typeof name !== 'string') {
      console.error('Erreur de validation: Le nom est requis et doit être une chaîne de caractères');
      return createCorsResponse({ 
        success: false,
        error: 'Validation échouée',
        message: 'Le nom est requis et doit être une chaîne de caractères.'
      }, 400, request);
    }

    // Vérifier si la catégorie existe déjà
    try {
      console.log('Vérification de l\'existence d\'une catégorie avec le nom:', name);
      const existingCategory = await prisma.projectCategory.findUnique({
        where: { name },
      });

      if (existingCategory) {
        console.error('Erreur: Une catégorie avec ce nom existe déjà');
        return createCorsResponse({ 
          success: false,
          error: 'Validation échouée',
          message: 'Une catégorie avec ce nom existe déjà.'
        }, 400, request);
      }
    } catch (dbError) {
      console.error('Erreur lors de la vérification de l\'existence de la catégorie:', dbError);
      return createCorsResponse({
        success: false,
        error: 'Erreur de base de données',
        message: 'Impossible de vérifier l\'existence de la catégorie.'
      }, 500, request);
    }

    // Créer la catégorie
    try {
      console.log('Création d\'une nouvelle catégorie avec les données:', { name, description, icon });
      const category = await prisma.projectCategory.create({
        data: {
          name,
          description: description || null,
          icon: icon || null,
        },
      });

      console.log('Catégorie créée avec succès:', category);
      
      return createCorsResponse({
        success: true,
        data: category,
        message: 'Catégorie créée avec succès.'
      }, 201, request);
      
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      
      return createCorsResponse({
        success: false,
        error: 'Erreur de base de données',
        message: 'Une erreur est survenue lors de la création de la catégorie.',
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : String(error)
          : undefined
      }, 500, request);
    }
  } catch (error) {
    console.error('Erreur inattendue dans la route POST /api/admin/categories:', error);
    
    return createCorsResponse({
      success: false,
      error: 'Erreur interne du serveur',
      message: 'Une erreur inattendue est survenue.',
      details: process.env.NODE_ENV === 'development' 
        ? error instanceof Error ? error.message : String(error)
        : undefined
    }, 500, request);
  }
}
