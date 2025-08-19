import { auth } from '@/auth';
import { notificationService } from '@/services/notificationService';
import { redirect } from 'next/navigation';
import { NotificationList } from '@/components/notifications/NotificationList';

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const currentPage = Number(searchParams?.page) || 1;
  const { data, pagination } = await notificationService.getUserNotifications(
    session.user.id,
    currentPage,
    20
  );

  // Convertir les dates en chaînes de caractères
  const notifications = data.map(notification => ({
    ...notification,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString()
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mes notifications</h1>
          {notifications.length > 0 && (
            <form
              action={async () => {
                'use server';
                await notificationService.markAllAsRead(session.user.id);
              }}
            >
              <button
                type="submit"
                className="text-sm font-medium text-primary hover:underline"
              >
                Tout marquer comme lu
              </button>
            </form>
          )}
        </div>

        <NotificationList 
          initialNotifications={notifications} 
          pagination={pagination} 
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
