import { NextResponse } from 'next/server';
import type { NextRequest, NextResponse as NextResponseType } from 'next/server';
import { auth } from '@/auth';

// Fonction utilitaire pour ajouter les en-têtes CORS
function addCorsHeaders(response: NextResponseType, request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Vary', 'Origin');
  
  return response;
}

export async function middleware(request: NextRequest) {
  // Gérer les requêtes OPTIONS pour CORS
  if (request.method === 'OPTIONS') {
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
      
      // Ajouter des en-têtes de cache pour éviter la mise en cache des réponses d'API
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('Surrogate-Control', 'no-store');
      
      return response;
    } catch (error) {
      console.error('Error in OPTIONS handler:', error);
      return new NextResponse(null, { status: 500 });
    }
  }

  // Créer une réponse de base avec les en-têtes CORS
  const response = NextResponse.next();
  const origin = request.headers.get('origin') || '*';
  
  try {
    // Définir les en-têtes CORS pour toutes les réponses
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    response.headers.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    
    // Ajouter des en-têtes de cache pour éviter la mise en cache des réponses d'API
    if (request.nextUrl.pathname.startsWith('/api')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('Surrogate-Control', 'no-store');
    }
  } catch (error) {
    console.error('Error setting CORS headers:', error);
    // Continuer même en cas d'erreur
  }

  // Routes d'API qui nécessitent une authentification
  const isApiAuthRoute = [
    '/api/admin',
    '/api/profile',
    '/api/projects',
    '/api/bids',
  ].some(path => request.nextUrl.pathname.startsWith(path));

  // Pages d'authentification
  const isAuthPage = ['/sign-in', '/sign-up'].some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Routes publiques qui ne nécessitent pas d'authentification
  const isPublicRoute = [
    '/',
    '/projects',
    '/categories',
    '/api/trpc',
    '/api/auth',
    '/api/categories',
  ].some(path => request.nextUrl.pathname.startsWith(path));

  // Routes d'administration qui nécessitent le rôle ADMIN
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  // Vérifier l'authentification uniquement pour les routes protégées
  if (isApiAuthRoute || isAdminRoute) {
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const isAdmin = session?.user?.role === 'ADMIN';

    // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
    if (!isLoggedIn) {
      if (isApiAuthRoute) {
        return new NextResponse(
          JSON.stringify({ error: 'Non authentifié', message: 'Veuillez vous connecter pour accéder à cette ressource' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Vérifier le rôle administrateur si nécessaire
    if ((isAdminRoute || request.nextUrl.pathname.startsWith('/api/admin')) && !isAdmin) {
      if (isApiAuthRoute) {
        return new NextResponse(
          JSON.stringify({ error: 'Accès refusé', message: 'Vous devez être administrateur pour accéder à cette ressource' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Vérifier si l'utilisateur est connecté
  const session = await auth();
  const isLoggedIn = !!session?.user;
  
  // Si l'utilisateur est déjà connecté et tente d'accéder à une page d'authentification
  if (isAuthPage && isLoggedIn) {
    const response = NextResponse.redirect(new URL('/', request.url));
    addCorsHeaders(response, request);
    return response;
  }

  // Vérifier l'accès aux routes d'administration
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/sign-in', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      const response = NextResponse.redirect(loginUrl);
      addCorsHeaders(response, request);
      return response;
    }
    
    // Vérifier si l'utilisateur est administrateur
    if (session?.user.role !== 'ADMIN') {
      const response = NextResponse.redirect(new URL('/unauthorized', request.url));
      addCorsHeaders(response, request);
      return response;
    }
  }

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une page protégée
  if (!isLoggedIn && !isPublicRoute && !isAuthPage) {
    const loginUrl = new URL('/sign-in', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    addCorsHeaders(response, request);
    return response;
  }

  return response;
}

export const config = {
  // Inclure toutes les routes, y compris les API
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};