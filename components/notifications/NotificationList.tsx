'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId: string | null;
  relatedType: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

type Pagination = {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
};

interface NotificationListProps {
  initialNotifications: Notification[];
  pagination: Pagination;
  userId: string;
}

export function NotificationList({ 
  initialNotifications, 
  pagination: initialPagination,
  userId 
}: NotificationListProps): JSX.Element {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loadMore = async () => {
    if (isLoading || !pagination.hasMore) return;
    
    setIsLoading(true);
    try {
      const nextPage = pagination.page + 1;
      const response = await fetch(`/api/notifications?page=${nextPage}`);
      
      if (!response.ok) {
        throw new Error('Échec du chargement des notifications');
      }
      
      const { data: newNotifications, pagination: newPagination } = await response.json();
      
      setNotifications(prev => [...prev, ...(newNotifications || [])]);
      setPagination({
        ...newPagination,
        page: nextPage,
        hasMore: nextPage < newPagination.totalPages
      });
    } catch (error) {
      console.error('Échec du chargement des notifications supplémentaires:', error);
      // Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Échec du marquage de la notification comme lue');
      }
      
      // Mettre à jour l'état local pour refléter le changement
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Rafraîchir le compteur de notifications non lues
      const unreadRes = await fetch('/api/notifications/unread-count');
      if (unreadRes.ok) {
        const { count } = await unreadRes.json();
        // Mettre à jour le compteur dans le composant parent si nécessaire
        if (window.parent) {
          window.parent.postMessage({ type: 'UPDATE_UNREAD_COUNT', count }, '*');
        }
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.relatedId) {
      if (notification.relatedType === 'PROJECT') {
        router.push(`/projects/${notification.relatedId}`);
      }
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucune notification pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
              !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      <span>Marquer comme lu</span>
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <time 
                    className="text-xs text-muted-foreground"
                    dateTime={notification.createdAt}
                  >
                    {formatDistanceToNow(new Date(notification.createdAt), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </time>
                  {notification.relatedId && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      Voir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.hasMore && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Afficher plus'}
          </Button>
        </div>
      )}
    </div>
  );
}
