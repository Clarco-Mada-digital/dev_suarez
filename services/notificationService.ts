import { prisma } from '@/lib/prisma';

// Types pour les notifications
type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'MESSAGE' | 'REVIEW' | 'SYSTEM' | 'PROJECT' | 'BID';

// Interface pour les données de notification
export interface NotificationData {
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

// Interface pour la réponse paginée
interface PaginatedResponse {
  data: NotificationData[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Service de notification
export const notificationService = {
  // Créer une nouvelle notification
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
  }): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    return notification as unknown as Notification;
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<Notification | null> {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    return notification as unknown as Notification;
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await prisma.notification.updateMany({
      where: { 
        userId,
        read: false 
      },
      data: { read: true },
    });
    
    return { success: true };
  },

  // Récupérer les notifications non lues
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: { 
        userId,
        read: false 
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    return notifications as unknown as Notification[];
  },

  // Récupérer toutes les notifications
  async getUserNotifications(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse> {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: notifications as unknown as NotificationData[],
      pagination: {
        total,
        page,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  },

  // Alias pour la rétrocompatibilité
  async getAllNotifications(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse> {
    return this.getUserNotifications(userId, page, limit);
  },
  
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { 
        userId,
        read: false,
      },
    });
  },

  // Supprimer une notification
  async deleteNotification(notificationId: string, userId: string): Promise<{ count: number }> {
    return prisma.notification.deleteMany({
      where: { 
        id: notificationId,
        userId, // S'assurer que l'utilisateur est bien le propriétaire
      },
    });
  },

  // Notifier un freelance d'un nouvel avis
  async notifyNewReview(freelancerId: string, projectId: string, clientName: string): Promise<Notification> {
    return this.createNotification({
      userId: freelancerId,
      type: 'REVIEW',
      title: 'Nouvel avis reçu',
      message: `Vous avez reçu un nouvel avis de la part de ${clientName}`,
      relatedId: projectId,
      relatedType: 'PROJECT',
    });
  },
};
