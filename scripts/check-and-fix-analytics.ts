import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndFixAnalyticsTable() {
  try {
    console.log('Vérification de la structure de la table analytics_events...');
    
    // Vérifier si la table existe
    const tableInfo = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='analytics_events';
    `;
    
    if (!tableInfo || (Array.isArray(tableInfo) && tableInfo.length === 0)) {
      console.error('La table analytics_events n\'existe pas');
      return;
    }
    
    console.log('Table analytics_events trouvée. Vérification des colonnes...');
    
    // Vérifier les colonnes existantes
    const columns = await prisma.$queryRaw`
      PRAGMA table_info(analytics_events);
    `;
    
    // Fonction pour gérer la sérialisation des BigInt
    const safeStringify = (obj: any) => {
      return JSON.stringify(obj, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      , 2);
    };
    
    console.log('Colonnes actuelles:', safeStringify(columns));
    
    // Vérifier si la colonne userId existe
    const hasUserId = Array.isArray(columns) && 
      columns.some((col: any) => col.name === 'userId');
    
    if (!hasUserId) {
      console.log('Ajout de la colonne userId...');
      await prisma.$executeRaw`
        ALTER TABLE "analytics_events" 
        ADD COLUMN "userId" TEXT;
      `;
      console.log('Colonne userId ajoutée avec succès.');
    } else {
      console.log('La colonne userId existe déjà.');
    }
    
    // Vérifier les index
    const indexes = await prisma.$queryRaw`
      PRAGMA index_list('analytics_events');
    `;
    
    console.log('Index actuels:', safeStringify(indexes));
    
  } catch (error) {
    console.error('Erreur lors de la vérification de la table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixAnalyticsTable();
