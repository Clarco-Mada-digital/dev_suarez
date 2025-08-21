import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTable() {
  try {
    // Vérifier si la table existe
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='analytics_events';
    `;
    
    console.log('Table exists:', tableExists);
    
    // Obtenir la structure de la table
    const tableInfo = await prisma.$queryRaw`
      PRAGMA table_info(analytics_events);
    `;
    
    console.log('Table structure:', tableInfo);
    
    // Compter les enregistrements
    const count = await prisma.analyticsEvent.count();
    console.log('Number of records:', count);
    
  } catch (error) {
    console.error('Error checking table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTable();
