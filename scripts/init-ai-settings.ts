import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Vérifier si les paramètres existent déjà
    const existingSettings = await prisma.aISettings.findUnique({
      where: { id: 'global' }
    });

    if (!existingSettings) {
      // Créer les paramètres par défaut
      await prisma.aISettings.create({
        data: {
          id: 'global',
          provider: 'mock',
          model: null,
          temperature: 0.4,
        },
      });
      console.log('✅ Paramètres AI initialisés avec succès');
    } else {
      console.log('ℹ️ Les paramètres AI existent déjà');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des paramètres AI:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
