'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertCircle, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { notificationApi } from '@/services/api/notificationApi';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
};

export function NotificationBell() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Récupérer les notifications
      const notificationsRes = await fetch('/api/notifications');
      const notificationsData = await notificationsRes.json();
      
      // Récupérer le nombre de notifications non lues
      const unreadRes = await fetch('/api/notifications/unread-count');
      const unreadData = await unreadRes.json();
      
      setNotifications(notificationsData.data || []);
      setUnreadCount(unreadData.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // Ne rien faire côté serveur ou si la session n'est pas chargée
    if (status !== 'authenticated' || !isClient) return;
    
    // Charger les notifications initiales
    fetchNotifications();

    // Configurer le polling pour les nouvelles notifications (toutes les 5 secondes)
    const interval = setInterval(fetchNotifications, 5000);
    
    // Écouter les événements personnalisés pour les mises à jour en temps réel
    const handleUpdateUnreadCount = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_UNREAD_COUNT') {
        setUnreadCount(event.data.count);
      }
    };
    
    // Gérer les nouvelles notifications
    const handleNewNotification = async (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string }>;
      // Vérifier si la notification est pour l'utilisateur actuel
      if (session?.user?.id === customEvent.detail?.userId) {
        // Recharger les notifications
        await fetchNotifications();
      }
    };
    
    // Ajouter les écouteurs d'événements
    window.addEventListener('message', handleUpdateUnreadCount);
    window.addEventListener('notification:new', handleNewNotification as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleUpdateUnreadCount);
      window.removeEventListener('notification:new', handleNewNotification as EventListener);
    };
  }, [session?.user?.id, status, isClient]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Marquer comme lue
      await fetch(`/api/notifications/${notification.id}`, { method: 'PUT' });
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Rediriger si nécessaire
      if (notification.relatedId && notification.relatedType === 'PROJECT') {
        router.push(`/projects/${notification.relatedId}`);
      }
      
      // Fermer le menu déroulant
      setIsOpen(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        
        // Émettre un événement pour mettre à jour d'autres instances
        window.dispatchEvent(new CustomEvent('notifications:all-read'));
      } else {
        console.error('Échec du marquage de toutes les notifications comme lues :', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues :', error);
    }
  };

  // Ne rien afficher côté serveur ou pendant le chargement
  if (!isClient || status === 'loading') {
    return (
      <Button variant="ghost" size="icon" className="relative" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="text-xs text-primary hover:underline"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`py-3 px-3 cursor-pointer hover:bg-accent ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${notification.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-center justify-center text-sm font-medium cursor-pointer"
          onClick={() => {
            router.push('/notifications');
            setIsOpen(false);
          }}
        >
          Voir toutes les notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
