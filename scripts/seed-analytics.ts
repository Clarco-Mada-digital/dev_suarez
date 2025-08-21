import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Début de la création des données de test pour les analyses...');

  // Vérifier si des données existent déjà
  const existingEvents = await prisma.analyticsEvent.count();
  
  if (existingEvents > 0) {
    console.log(`Il y a déjà ${existingEvents} événements dans la base de données.`);
    return;
  }

  // Créer des événements pour les 30 derniers jours
  const events = [];
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const eventTypes = ['page_view', 'click', 'form_submission', 'download'];
  const paths = ['/', '/projets', '/freelancers', '/contact', '/a-propos'];
  const referrers = [
    'https://www.google.com',
    'https://www.facebook.com',
    'https://www.linkedin.com',
    'https://twitter.com',
    'https://www.instagram.com',
    'direct',
  ];

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  ];

  // Générer des événements pour chaque jour des 30 derniers jours
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(thirtyDaysAgo);
    currentDate.setDate(thirtyDaysAgo.getDate() + day);
    
    // Nombre aléatoire d'événements pour ce jour (entre 50 et 200)
    const eventsForDay = faker.number.int({ min: 50, max: 200 });
    
    for (let i = 0; i < eventsForDay; i++) {
      const eventDate = new Date(currentDate);
      // Ajouter un décalage aléatoire dans la journée (en millisecondes)
      eventDate.setTime(eventDate.getTime() + faker.number.int({ min: 0, max: 86399999 }));
      
      const eventType = faker.helpers.arrayElement(eventTypes);
      const path = faker.helpers.arrayElement(paths);
      const referrer = faker.helpers.arrayElement(referrers);
      const userAgent = faker.helpers.arrayElement(userAgents);
      
      // Générer un ID de session (même ID pour plusieurs événements de la même session)
      const sessionId = `session-${faker.string.uuid()}`;
      
      // Créer entre 1 et 10 événements par session
      const eventsInSession = faker.number.int({ min: 1, max: 10 });
      
      for (let j = 0; j < eventsInSession; j++) {
        events.push({
          eventType,
          path,
          sessionId,
          referrer: referrer === 'direct' ? null : referrer,
          userAgent,
          screenWidth: faker.helpers.arrayElement([1920, 1366, 1536, 360, 414, 375, null]),
          screenHeight: faker.helpers.arrayElement([1080, 768, 864, 640, 896, 812, null]),
          language: faker.helpers.arrayElement(['fr-FR', 'en-US', 'es-ES', 'de-DE']),
          additionalData: {},
          createdAt: eventDate,
          updatedAt: eventDate,
        });
      }
    }
  }

  console.log(`Création de ${events.length} événements...`);
  
  // Insérer les événements par lots de 1000
  const batchSize = 1000;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await prisma.analyticsEvent.createMany({
      data: batch
    });
    console.log(`Lot ${i / batchSize + 1} inséré (${Math.min(i + batchSize, events.length)}/${events.length})`);
  }

  console.log('Données de test créées avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
