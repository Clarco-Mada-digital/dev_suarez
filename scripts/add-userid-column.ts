import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addUserIdColumn() {
  try {
    console.log('Vérification de la colonne userId...');
    
    // Vérifier si la colonne userId existe déjà
    const columnExists = await prisma.$queryRaw`
      SELECT name FROM pragma_table_info('analytics_events') 
      WHERE name = 'userId';
    `;
    
    if (Array.isArray(columnExists) && columnExists.length === 0) {
      console.log('Ajout de la colonne userId...');
      
      // Ajouter la colonne userId
      await prisma.$executeRaw`
        ALTER TABLE "analytics_events" 
        ADD COLUMN "userId" TEXT;
      `;
      
      console.log('Colonne userId ajoutée avec succès.');
    } else {
      console.log('La colonne userId existe déjà.');
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la colonne userId:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUserIdColumn();
