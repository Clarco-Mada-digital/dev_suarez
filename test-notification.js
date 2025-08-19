const { prisma } = require('./lib/prisma');

async function testNotification() {
  try {
    // Créer une notification de test directement avec Prisma
    const notification = await prisma.notification.create({
      data: {
        userId: 'user-test-id',
        type: 'TEST',
        title: 'Test Notification',
        message: 'This is a test notification',
        read: false,
      },
    });

    console.log('Notification créée avec succès:', notification);
    
    // Récupérer les notifications non lues
    const unread = await prisma.notification.findMany({
      where: { 
        userId: 'user-test-id',
        read: false 
      },
    });
    
    console.log('Notifications non lues:', unread);
    
  } catch (error) {
    console.error('Erreur lors du test des notifications:', error);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

testNotification();
