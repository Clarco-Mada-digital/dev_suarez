'use client';

import { useState, useEffect } from 'react';
import { Bell, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationData } from '@/services/notificationService';
type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'MESSAGE' | 'REVIEW' | 'SYSTEM' | 'PROJECT' | 'BID';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';


export function SimpleNotificationBell() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les notifications non lues au montage et vérifier périodiquement
  useEffect(() => {
    fetchUnreadCount();
    
    // Vérifier les nouvelles notifications toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Charger les notifications lorsque le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const session = await fetch('/api/auth/session');
      if (!session.ok) return;
      
      const { user } = await session.json();
      if (!user?.id) return;
      
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de notifications non lues:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const session = await fetch('/api/auth/session');
      if (!session.ok) return;
      
      const { user } = await session.json();
      if (!user?.id) return;
      
      const res = await fetch(`/api/notifications?page=1&limit=5`);
      if (res.ok) {
        const response = await res.json();
        // Utiliser response.data au lieu de response.notifications
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Erreur lors du marquage de la notification comme lue');
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: NotificationData) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    setIsOpen(false);
    
    if (notification.relatedId && notification.relatedType === 'PROJECT') {
      window.location.href = `/projects/${notification.relatedId}`;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
        <div className="flex items-center justify-between p-4">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex flex-col items-start gap-1 p-3 cursor-pointer',
                    !notification.read && 'bg-accent/50',
                    'hover:bg-accent/80 transition-colors'
                  )}
                  onSelect={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full items-start gap-2">
                    <div className="mt-0.5">
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          {notification.title}
                        </h4>
                        <time
                          className="text-xs text-muted-foreground"
                          dateTime={new Date(notification.createdAt).toISOString()}
                        >
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </time>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="flex items-center justify-center p-2 text-sm text-center text-muted-foreground hover:text-foreground"
          >
            Voir toutes les notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
