const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function insertTestCategories() {
  try {
    console.log('Insertion des catégories de test...');
    
    // Vérifier si des catégories existent déjà
    const existingCategories = await prisma.projectCategory.findMany();
    
    if (existingCategories.length > 0) {
      console.log('Des catégories existent déjà. Suppression des catégories existantes...');
      await prisma.projectCategory.deleteMany({});
    }
    
    // Insérer des catégories de test
    const categories = [
      {
        id: '1',
        name: 'Développement Web',
        description: 'Sites web, applications web et services en ligne',
        icon: '/icons/web-dev.png',
      },
      {
        id: '2',
        name: 'Design Graphique',
        description: 'Logos, identité visuelle, illustrations',
        icon: '/icons/graphic-design.png',
      },
      {
        id: '3',
        name: 'Rédaction',
        description: 'Articles, traductions, réécriture',
        icon: '/icons/writing.png',
      },
    ];
    
    const createdCategories = await prisma.$transaction(
      categories.map(category => 
        prisma.projectCategory.upsert({
          where: { id: category.id },
          update: {},
          create: category,
        })
      )
    );
    
    console.log(`${createdCategories.length} catégories ont été insérées avec succès !`);
    console.log('Catégories insérées :', createdCategories);
    
  } catch (error) {
    console.error('Erreur lors de l\'insertion des catégories :', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertTestCategories();
