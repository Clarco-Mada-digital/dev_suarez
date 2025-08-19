import { Notification } from "@/types/notification";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const notificationApi = {
  // Récupérer les notifications paginées
  async getNotifications(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Notification>> {
    const response = await fetch(`/api/notifications?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des notifications');
    }

    return response.json();
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ read: true }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du marquage de la notification comme lue');
    }

    return response.json();
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    const response = await fetch('/api/notifications', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du marquage de toutes les notifications comme lues');
    }
  },

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<void> {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la notification');
    }
  },

  // Récupérer le nombre de notifications non lues
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await fetch('/api/notifications/unread-count');

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du nombre de notifications non lues');
    }

    return response.json();
  },
};
