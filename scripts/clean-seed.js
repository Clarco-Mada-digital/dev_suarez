// Clean seed script with proper foreign key handling
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting clean seed...');

    // Disable foreign key checks
    console.log('🔧 Disabling foreign key checks...');
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

    // Clean up tables in the correct order
    console.log('🧹 Cleaning up existing data...');
    await prisma.$executeRaw`DELETE FROM project_skills;`;
    await prisma.$executeRaw`DELETE FROM project_bids;`;
    await prisma.$executeRaw`DELETE FROM projects;`;
    await prisma.$executeRaw`DELETE FROM project_categories;`;
    await prisma.$executeRaw`DELETE FROM accounts;`;
    await prisma.$executeRaw`DELETE FROM sessions;`;
    await prisma.$executeRaw`DELETE FROM user_profiles;`;
    await prisma.$executeRaw`DELETE FROM users;`;

    // Re-enable foreign key checks
    console.log('✅ Re-enabling foreign key checks...');
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;

    console.log('📝 Creating categories...');
    const categories = [
      {
        id: '1',
        name: 'Développement Web',
        description: 'Sites web, applications web et services en ligne',
        icon: '/dev-icon.png',
      },
      {
        id: '2',
        name: 'Design Graphique',
        description: 'Logos, identité visuelle, illustrations',
        icon: '/design-icon.png',
      },
      {
        id: '3',
        name: 'Rédaction',
        description: 'Articles, traductions, réécriture',
        icon: '/writing-icon.png',
      },
    ];

    for (const category of categories) {
      await prisma.projectCategory.upsert({
        where: { id: category.id },
        update: {},
        create: category,
      });
    }

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Error in seed script:', e);
  process.exit(1);
});
