import { NextResponse, NextRequest } from 'next/server';
import { auth } from './auth';

// Définir les routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ['/sign-in', '/sign-up', '/'];

export default async function middleware(request: NextRequest) {
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (!isPublicRoute) {
    const session = await auth.getSession();
    if (!session?.id) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};