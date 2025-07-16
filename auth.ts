import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const auth = {
  async getSession() {
    const session = await prisma.user.findFirst({
      where: {
        email: auth.getEmail(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    return session;
  },
  getEmail() {
    return typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  },
  setEmail(email: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('email', email);
    }
  },
  removeEmail() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('email');
    }
  },
  async signOut() {
    const email = auth.getEmail();
    if (email) {
      localStorage.removeItem('email');
    }
    return null;
  },
};

export const getAuth = () => {
  return auth;
};

export const isAuthenticated = () => {
  return !!auth.getEmail();
};

export const requireAuth = async () => {
  const session = await auth.getSession();
  if (!session) {
    throw new Error('User not authenticated');
  }
  return session.id;
};

export const signIn = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      passwordHash: true,
      passwordSalt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  auth.setEmail(email);
  return user;
};

export const signUp = async (email: string, password: string, name?: string) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hash,
      passwordSalt: salt,
    },
  });

  auth.setEmail(email);
  return user;
};

export const signOut = () => {
  auth.removeEmail();
  redirect('/');
};
