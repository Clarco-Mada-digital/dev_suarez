// Non-destructive freelancer population script
// Run with: node scripts/add-freelancers.js

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const prisma = new PrismaClient();

const now = new Date();

const freelancers = [
  // DESIGNERS
  {
    name: 'Alice Martin', email: 'alice.designer@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/women/11.jpg',
    profile: {
      jobTitle: 'Designer UI/UX',
      skills: 'Design, UI, UX, Figma, Sketch, Maquette, Prototype, Wireframe, Charte Graphique, Branding, Adobe XD, Illustrator',
      rating: 4.9, hourlyRate: 55, availability: true,
      bio: 'Designer UI/UX spécialisée en maquettes Figma et tests utilisateurs.', location: 'Paris, France', website: 'https://aliceux.example.com'
    }
  },
  {
    name: 'Bruno Lefevre', email: 'bruno.uiux@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/men/12.jpg',
    profile: {
      jobTitle: 'UX Designer / Product Designer',
      skills: 'UX, UI, Figma, Prototypage, Wireframes, Design System, Accessibilité, Maquette',
      rating: 4.7, hourlyRate: 60, availability: true,
      bio: 'Expert UX avec forte expérience en design system et accessibilité.', location: 'Lyon, France', website: 'https://brunoux.example.com'
    }
  },
  {
    name: 'Carla Gomez', email: 'carla.graphiste@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/women/13.jpg',
    profile: {
      jobTitle: 'Graphiste & UI Designer',
      skills: 'Graphisme, Branding, Charte Graphique, Photoshop, Illustrator, UI, Maquette',
      rating: 4.8, hourlyRate: 45, availability: false,
      bio: 'Graphiste orientée identité visuelle et interfaces épurées.', location: 'Bordeaux, France', website: 'https://carladesign.example.com'
    }
  },
  {
    name: 'David Nguyen', email: 'david.productdesigner@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/men/14.jpg',
    profile: {
      jobTitle: 'Product Designer (UI/UX)',
      skills: 'UI, UX, Figma, Sketch, Prototype, Tests Utilisateurs, Wireframe',
      rating: 4.6, hourlyRate: 65, availability: true,
      bio: 'Product Designer avec approche data-driven et recherche utilisateur.', location: 'Marseille, France', website: 'https://davidpd.example.com'
    }
  },

  // SEO
  {
    name: 'Emma Rousseau', email: 'emma.seo@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/women/21.jpg',
    profile: {
      jobTitle: 'Consultante SEO',
      skills: 'SEO, Référencement, On-page, Netlinking, SEMrush, Ahrefs, Google Search Console, Mots-clés',
      rating: 4.8, hourlyRate: 70, availability: true,
      bio: 'Consultante SEO senior, audits techniques et stratégie contenu.', location: 'Nantes, France', website: 'https://emmaseo.example.com'
    }
  },
  {
    name: 'Florian Petit', email: 'florian.referencement@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/men/22.jpg',
    profile: {
      jobTitle: 'Spécialiste Référencement',
      skills: 'SEO, Référencement, Technique, Core Web Vitals, On-page, Netlinking',
      rating: 4.5, hourlyRate: 55, availability: true,
      bio: 'Amélioration technique et performance pour un meilleur ranking.', location: 'Toulouse, France', website: 'https://florianseo.example.com'
    }
  },

  // TRADUCTION
  {
    name: 'Giulia Bianchi', email: 'giulia.trad@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/women/31.jpg',
    profile: {
      jobTitle: 'Traductrice FR-IT-EN',
      skills: 'Traduction, Localisation, Linguistique, Relecture, QA, Glossaire, Trados, memoQ',
      rating: 4.9, hourlyRate: 40, availability: true,
      bio: 'Traductrice native IT, spécialisée technique et marketing.', location: 'Milan, Italie', website: 'https://giuliatrad.example.com'
    }
  },
  {
    name: 'Hassan El Amrani', email: 'hassan.localisation@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/men/32.jpg',
    profile: {
      jobTitle: 'Traducteur & Localisation (AR/FR/EN)',
      skills: 'Localisation, Traduction, Relecture, QA Linguistique, Glossaire',
      rating: 4.6, hourlyRate: 38, availability: false,
      bio: 'Localisation d’applications et sites avec sensibilité culturelle.', location: 'Casablanca, Maroc', website: 'https://hassanloc.example.com'
    }
  },

  // MARKETING
  {
    name: 'Inès Dubois', email: 'ines.marketing@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/women/41.jpg',
    profile: {
      jobTitle: 'Growth/Marketing Manager',
      skills: 'Marketing, Acquisition, Content, Ads, Google Ads, Meta Ads, Social, Newsletter, CRM, GA4, KPI, ROAS, CAC',
      rating: 4.7, hourlyRate: 65, availability: true,
      bio: 'Stratégie d’acquisition full-funnel et contenus.', location: 'Lille, France', website: 'https://inesgrowth.example.com'
    }
  },
  {
    name: 'Jules Caron', email: 'jules.socialads@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/men/42.jpg',
    profile: {
      jobTitle: 'Spécialiste Social Ads',
      skills: 'Marketing, Ads, Meta Ads, Social, KPI, GA4',
      rating: 4.4, hourlyRate: 50, availability: true,
      bio: 'Campagnes Meta/Instagram/LinkedIn, A/B tests, dashboards.', location: 'Rennes, France', website: 'https://julessocial.example.com'
    }
  },

  // DÉVELOPPEMENT
  {
    name: 'Kevin Morel', email: 'kevin.dev@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/men/51.jpg',
    profile: {
      jobTitle: 'Développeur Frontend',
      skills: 'Dev, Développement, Frontend, React, Next, TypeScript, Tailwind',
      rating: 4.6, hourlyRate: 55, availability: true,
      bio: 'Frontend performant et accessible (Next.js/React).', location: 'Montpellier, France', website: 'https://kevinfront.example.com'
    }
  },
  {
    name: 'Laura Bernard', email: 'laura.fullstack@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/women/52.jpg',
    profile: {
      jobTitle: 'Développeuse Full Stack',
      skills: 'Dev, Développement, Fullstack, React, Next, Node, Prisma, PostgreSQL',
      rating: 4.8, hourlyRate: 70, availability: false,
      bio: 'Full stack orientée produit avec CI/CD et tests.', location: 'Paris, France', website: 'https://laurafs.example.com'
    }
  },
  {
    name: 'Marc Diallo', email: 'marc.backend@example.com', role: 'FREELANCER', image: 'https://randomuser.me/api/portraits/men/53.jpg',
    profile: {
      jobTitle: 'Développeur Backend',
      skills: 'Développement, Backend, Node, API, Prisma, Architecture, Sécurité',
      rating: 4.5, hourlyRate: 60, availability: true,
      bio: 'APIs robustes, performances et sécurité.', location: 'Dakar, Sénégal', website: 'https://marcback.example.com'
    }
  },
];

async function upsertFreelancer(entry, hashedPassword) {
  const { name, email, role, image, profile } = entry;
  // Upsert user by email (unique)
  const existing = await prisma.user.findUnique({ where: { email } });
  let user;
  if (!existing) {
    user = await prisma.user.create({
      data: {
        name, email, role, image, emailVerified: now,
        passwordHash: hashedPassword,
        profile: { create: { ...profile, languages: profile.languages || 'Français, Anglais' } },
      },
    });
  } else {
    // Ensure role/image and password are set
    const needsPassword = !existing.passwordHash;
    user = await prisma.user.update({ where: { email }, data: { name, role, image, ...(needsPassword ? { passwordHash: hashedPassword, emailVerified: existing.emailVerified || now } : {}) } });
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...profile, languages: profile.languages || 'Français, Anglais' },
      update: { ...profile },
    });
  }
  return user;
}

async function main() {
  try {
    console.log('👤 Upserting freelancers...');
    const PASSWORD = process.env.SEED_PASSWORD || 'Freelance123!';
    const hashedPassword = await hash(PASSWORD, 10);
    let created = 0, updated = 0;

    for (const entry of freelancers) {
      const before = await prisma.user.findUnique({ where: { email: entry.email } });
      await upsertFreelancer(entry, hashedPassword);
      const after = await prisma.user.findUnique({ where: { email: entry.email } });
      if (before) updated++; else created++;
      console.log(`✔ ${after.name} (${entry.profile.jobTitle})`);
    }

    console.log(`\n✅ Done. Created: ${created}, Updated: ${updated}`);
    console.log(`🔐 Default password set for these freelancers. Use SEED_PASSWORD env to override. Current default: ${process.env.SEED_PASSWORD ? '(from SEED_PASSWORD)' : 'Freelance123!'}`);
  } catch (e) {
    console.error('❌ Error populating freelancers:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
