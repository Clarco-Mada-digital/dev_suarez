// Simple seed script using CommonJS
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting simple seed...');

    // Nettoyer les données existantes
    console.log('🧹 Cleaning up existing data...');
    await prisma.projectBid.deleteMany();
    await prisma.projectSkill.deleteMany();
    await prisma.project.deleteMany();
    await prisma.projectCategory.deleteMany();
    await prisma.user.deleteMany();

    console.log('📝 Creating categories...');
    const categories = [
      {
        id: '1',
        name: 'Site & Développement',
        description: 'Développeurs web et applications pour tous vos besoins techniques',
        icon: '/dev-icon.png',
      },
      {
        id: '2',
        name: 'Community',
        description: 'Experts en gestion de communauté et réseaux sociaux',
        icon: '/man.png',
      },
      {
        id: '3',
        name: 'Design & Graphisme',
        description: 'Des designers créatifs pour tous vos besoins graphiques',
        icon: '/designe.png',
      },
      {
        id: '4',
        name: 'SEO & Communication',
        description: 'Experts en référencement et stratégie de communication',
        icon: '/seo.png',
      },
      {
        id: '5',
        name: 'Réseaux sociaux',
        description: 'Gestion complète de vos réseaux sociaux',
        icon: '/reseau.png',
      },
    ];

    // Créer les catégories
    const createdCategories = [];
    const allCategories = [
      ...categories,
      {
        id: '6',
        name: 'Rédaction',
        description: 'Des rédacteurs professionnels pour tous vos contenus',
        icon: '/redacteur.png',
      },
      {
        id: '7',
        name: 'Audiovisuel',
        description: 'Professionnels de l\'image et du son pour vos projets créatifs',
        icon: '/audioVisuel.png',
      },
      {
        id: '8',
        name: 'Formation & Coaching',
        description: 'Experts en formation et accompagnement professionnel',
        icon: '/formation.png',
      }
    ];

    for (const category of allCategories) {
      const createdCategory = await prisma.projectCategory.upsert({
        where: { id: category.id },
        update: category,
        create: category,
      });
      createdCategories.push(createdCategory);
    }

    console.log('👥 Creating test users...');
    const client1 = await prisma.user.create({
      data: {
        name: 'Client Entreprise',
        email: 'client1@example.com',
        emailVerified: new Date(),
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
    });

    const freelancer1 = await prisma.user.create({
      data: {
        name: 'Développeur Full Stack',
        email: 'dev@example.com',
        emailVerified: new Date(),
        image: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
    });

    console.log('🚀 Creating a test project...');
    const project = await prisma.project.create({
      data: {
        title: 'Site vitrine pour restaurant',
        description: 'Création d\'un site vitrine moderne pour un restaurant avec menu en ligne et formulaire de réservation.',
        budget: 1500,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        status: 'OPEN',
        clientId: client1.id,
        categoryId: createdCategories[0].id, // Utiliser la première catégorie créée
        skills: {
          create: [
            { name: 'React' },
            { name: 'Next.js' },
            { name: 'Tailwind CSS' },
          ],
        },
      },
    });

    console.log('💼 Creating a test bid...');
    await prisma.projectBid.create({
      data: {
        amount: 1200,
        proposal: 'Je suis intéressé par votre projet et je propose de le réaliser pour 1200€.',
        status: 'PENDING',
        projectId: project.id,
        freelancerId: freelancer1.id,
      },
    });

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Error in seed script:', e);
  process.exit(1);
});
