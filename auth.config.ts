import type { NextAuthConfig } from 'next-auth';

type UserRole = 'ADMIN' | 'USER' | 'FREELANCER' | 'CLIENT';
 
export const authConfig = {
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = [
        '/',
        '/sign-in',
        '/sign-up',
        '/projects',
        '/categories',
      ].some(path => nextUrl.pathname.startsWith(path));

      if (isPublicRoute) {
        return true;
      }

      if (isLoggedIn) {
        return true;
      }

      return false; // Redirige vers la page de connexion
    },
    jwt({ token, user }) {
      if (user) { // L'utilisateur est disponible lors de la connexion
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
  providers: [], // Les fournisseurs sont définis dans le fichier principal
} satisfies NextAuthConfig;
