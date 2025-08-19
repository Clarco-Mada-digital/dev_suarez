import { Prisma as PrismaNamespace, PrismaClient } from '@prisma/client';

declare global {
  namespace PrismaClient {
    interface Notification extends PrismaNamespace.Notification {}
  }
  
  // Étendre le type PrismaClient pour inclure le modèle Notification
  interface PrismaClient {
    notification: {
      create: (args: any) => Promise<Notification>;
      update: (args: any) => Promise<Notification>;
      updateMany: (args: any) => Promise<{ count: number }>;
      findMany: (args: any) => Promise<Notification[]>;
      findUnique: (args: any) => Promise<Notification | null>;
      count: (args: any) => Promise<number>;
      delete: (args: any) => Promise<Notification>;
      deleteMany: (args: any) => Promise<{ count: number }>;
    };
  }
}
