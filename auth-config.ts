import type { NextAuthConfig } from 'next-auth';

type UserRole = 'ADMIN' | 'USER' | 'FREELANCER' | 'CLIENT';

declare module 'next-auth' {
  interface User {
    id: string;
    role?: UserRole;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role?: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authConfig: NextAuthConfig = {
  // Configuration des pages personnalisées
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
  },
  
  // Configuration de la session
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  
  // Callbacks
  callbacks: {
    // Callback pour l'autorisation des routes
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = ['/sign-in', '/sign-up'].includes(nextUrl.pathname);
      const isPublicRoute = [
        '/',
        '/projects',
        '/categories',
        '/api/trpc',
      ].some(path => nextUrl.pathname.startsWith(path));

      // Si l'utilisateur est sur une page d'authentification et est déjà connecté
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // Si la route est publique, on autorise l'accès
      if (isPublicRoute) {
        return true;
      }

      // Si l'utilisateur est connecté, on autorise l'accès
      if (isLoggedIn) {
        return true;
      }

      // Sinon, on redirige vers la page de connexion
      return Response.redirect(new URL('/sign-in', nextUrl));
    },
    
    // Callback pour le JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    
    // Callback pour la session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.name = token.name;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  
  // Configuration des fournisseurs (définis dans auth.ts)
  providers: [],
  
  // Configuration de débogage
  debug: process.env.NODE_ENV === 'development',
  
  // Configuration des cookies
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
