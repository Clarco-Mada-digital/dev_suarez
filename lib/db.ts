import { PrismaClient } from '@prisma/client';

declare global {
  // This prevents duplicate instances of PrismaClient in development
  var prisma: PrismaClient | undefined;
}

// Initialize PrismaClient
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, store the client in a global variable to prevent
// creating new connections on every hot-reload
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
