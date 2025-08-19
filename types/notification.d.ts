import { Prisma } from '@prisma/client';

declare global {
  namespace Prisma {
    interface Notification {
      id: string;
      userId: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      relatedId: string | null;
      relatedType: string | null;
      createdAt: Date;
      updatedAt: Date;
      user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
      };
    }

    interface PrismaClient {
      notification: {
        create: (args: any) => Promise<Notification>;
        update: (args: any) => Promise<Notification>;
        updateMany: (args: any) => Promise<{ count: number }>;
        findMany: (args: any) => Promise<Notification[]>;
        count: (args: any) => Promise<number>;
        deleteMany: (args: any) => Promise<{ count: number }>;
      };
    }
  }
}

export {};
