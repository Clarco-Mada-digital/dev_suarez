import { prisma } from '@/lib/prisma';

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'MESSAGE' | 'REVIEW' | 'SYSTEM' | 'PROJECT' | 'BID';

interface NotificationData {
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

export const NotificationService = {
  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
  }): Promise<NotificationData> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
      },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });
    return notification as unknown as NotificationData;
  },

  async markAsRead(notificationId: string): Promise<NotificationData | null> {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });
    return notification as unknown as NotificationData;
  },

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { count: result.count };
  },

  async getUnread(userId: string, limit = 10): Promise<NotificationData[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });
    return notifications as unknown as NotificationData[];
  },

  async getPaginated(
    userId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ data: NotificationData[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: data as unknown as NotificationData[],
      total,
    };
  },

  async notifyNewReview(freelancerId: string, projectId: string, clientName: string): Promise<NotificationData> {
    return this.create({
      userId: freelancerId,
      type: 'REVIEW',
      title: 'Nouvel avis reçu',
      message: `Vous avez reçu un nouvel avis de la part de ${clientName}`,
      relatedId: projectId,
      relatedType: 'PROJECT',
    });
  },
};
