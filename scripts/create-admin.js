const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    const name = 'Admin User';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Admin user already exists:', existingUser);
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur admin
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        emailVerified: new Date(),
        role: 'ADMIN',
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'User',
            bio: 'Administrator account',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log('Admin user created successfully:');
    console.log({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
