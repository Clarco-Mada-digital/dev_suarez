import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Starting seed...');

  // Nettoyer les données existantes
  console.log('🧹 Cleaning up existing data...');
  await prisma.projectBid.deleteMany();
  await prisma.projectSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.projectCategory.deleteMany();
  await prisma.user.deleteMany();

  // Créer des catégories
  console.log('📝 Creating categories...');
  const categories = await Promise.all([
    prisma.projectCategory.create({
      data: {
        id: '1',
        name: 'Site & Développement',
        description: 'Développeurs web et applications pour tous vos besoins techniques',
        icon: '/dev-icon.png',
      },
    }),
    prisma.projectCategory.create({
      data: {
        id: '2',
        name: 'Community',
        description: 'Experts en gestion de communauté et réseaux sociaux',
        icon: '/man.png',
      },
    }),
    prisma.projectCategory.create({
      data: {
        id: '3',
        name: 'Design & Graphisme',
        description: 'Des designers créatifs pour tous vos besoins graphiques',
        icon: '/designe.png',
      },
    }),
    prisma.projectCategory.create({
      data: {
        id: '4',
        name: 'SEO & Communication',
        description: 'Experts en référencement et stratégie de communication',
        icon: '/seo.png',
      },
    }),
    prisma.projectCategory.create({
      data: {
        id: '5',
        name: 'Réseaux sociaux',
        description: 'Gestion complète de vos réseaux sociaux',
        icon: '/reseau.png',
      },
    }),
  ]);

  // Créer des utilisateurs test
  console.log('👥 Creating test users...');
  const password = await hash('password123', 12);
  
  const [client1, client2, freelancer1, freelancer2] = await Promise.all([
    // Clients
    prisma.user.create({
      data: {
        name: 'Client Entreprise',
        email: 'client1@example.com',
        emailVerified: new Date(),
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Startup Innovante',
        email: 'client2@example.com',
        emailVerified: new Date(),
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
    }),
    // Freelances
    prisma.user.create({
      data: {
        name: 'Développeur Full Stack',
        email: 'dev@example.com',
        emailVerified: new Date(),
        image: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Designer UI/UX',
        email: 'designer@example.com',
        emailVerified: new Date(),
        image: 'https://randomuser.me/api/portraits/women/4.jpg',
      },
    }),
  ]);

  // Créer des projets de test
  console.log('🚀 Creating test projects...');
  const projects = [
    {
      title: 'Site vitrine pour restaurant',
      description: `Je cherche un développeur pour créer un site vitrine moderne pour mon restaurant. Le site doit inclure :
      - Page d'accueil avec diaporama de plats
      - Menu en ligne avec catégories
      - Formulaire de réservation
      - Page de contact avec carte Google Maps
      - Design responsive
      
      Le site doit être optimisé pour le référencement et rapide à charger.`,
      budget: 1500,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      categoryId: categories[0].id,
      clientId: client1.id,
      skills: ['React', 'Next.js', 'Tailwind CSS', 'Responsive Design'],
    },
    {
      title: 'Refonte de logo et identité visuelle',
      description: `Je lance ma marque de vêtements éco-responsables et j'ai besoin d'une identité visuelle complète :
      - Création d'un logo moderne et mémorable
      - Charte graphique (couleurs, typographie)
      - Supports de communication (cartes de visite, en-têtes réseaux sociaux)
      
      Je recherche un design épuré, moderne avec une touche naturelle.`,
      budget: 800,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
      categoryId: categories[1].id,
      clientId: client2.id,
      skills: ['Logo Design', 'Brand Identity', 'Adobe Illustrator'],
    },
    {
      title: 'Application de gestion de tâches',
      description: `Développement d'une application web de gestion de tâches avec les fonctionnalités suivantes :
      - Création et gestion de projets
      - Tableau Kanban
      - Calendrier intégré
      - Notifications en temps réel
      - Authentification utilisateur
      
      Stack technique : MERN (MongoDB, Express, React, Node.js)`,
      budget: 3500,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
      categoryId: categories[0].id,
      clientId: client2.id,
      skills: ['MongoDB', 'Express', 'React', 'Node.js', 'WebSocket'],
    },
  ];

  for (const projectData of projects) {
    const { skills, ...project } = projectData;
    const createdProject = await prisma.project.create({
      data: {
        ...project,
        skills: {
          create: skills.map((skill) => ({
            name: skill,
          })),
        },
      },
    });

    console.log(`✅ Created project: ${createdProject.title}`);
  }

  // Créer des offres de test
  console.log('💼 Creating test bids...');
  const projectToBid = await prisma.project.findFirst({
    where: { title: 'Site vitrine pour restaurant' },
  });

  if (projectToBid) {
    await prisma.projectBid.create({
      data: {
        amount: 1200,
        proposal: `Bonjour,
        
        Je suis un développeur Full Stack avec 5 ans d'expérience dans la création de sites web pour des restaurants. J'ai déjà réalisé plusieurs projets similaires que je peux vous montrer.
        
        Pour votre projet, je propose :
        - Développement avec Next.js pour des performances optimales
        - Design responsive et moderne
        - Intégration avec un système de réservation
        - Optimisation SEO
        - Formation à l'utilisation du back-office
        
        Je suis disponible pour commencer dès la semaine prochaine.
        
        Cordialement,`,
        status: 'PENDING',
        projectId: projectToBid.id,
        freelancerId: freelancer1.id,
      },
    });

    console.log('✅ Created bid for restaurant website project');
  }

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
