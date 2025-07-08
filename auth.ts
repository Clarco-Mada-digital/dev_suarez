import { auth as clerkAuth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Réexport des fonctions de Clerk
export const auth = clerkAuth;

export const getAuth = () => {
  return clerkAuth();
};

export const isAuthenticated = () => {
  return !!getAuth().userId;
};

export const requireAuth = async () => {
  const { userId } = getAuth();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  return userId;
};

// Fonctions d'aide pour la redirection
export const redirectToSignIn = () => {
  redirect('/sign-in');
};

export const signIn = () => {
  redirect('/sign-in');
};

export const signUp = () => {
  redirect('/sign-up');
};

export const signOut = () => {
  redirect('/sign-out');
};
