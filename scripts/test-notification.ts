import { NotificationService } from '../services/notification-service';

async function testNotification() {
  try {
    // Créer une notification de test
    const notification = await NotificationService.create({
      userId: 'user-test-id', // Remplacez par un ID d'utilisateur valide
      type: 'TEST',
      title: 'Notification de test',
      message: 'Ceci est une notification de test',
      relatedId: 'test-id',
      relatedType: 'TEST',
    });

    console.log('Notification créée avec succès:', notification);
    
    // Récupérer les notifications non lues
    const unread = await NotificationService.getUnread('user-test-id');
    console.log('Notifications non lues:', unread);
    
    // Marquer comme lue
    if (notification) {
      const marked = await NotificationService.markAsRead(notification.id);
      console.log('Notification marquée comme lue:', marked);
    }
    
  } catch (error) {
    console.error('Erreur lors du test des notifications:', error);
  }
}

testNotification()
  .catch(console.error)
  .finally(() => process.exit());
