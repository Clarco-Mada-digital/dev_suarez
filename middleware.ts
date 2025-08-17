import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  
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
  ].some(path => request.nextUrl.pathname.startsWith(path));

  // Si l'utilisateur est déjà connecté et tente d'accéder à une page d'authentification
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une page protégée
  if (!isLoggedIn && !isPublicRoute && !isAuthPage) {
    const loginUrl = new URL('/sign-in', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Exclure les fichiers statiques et les API
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};