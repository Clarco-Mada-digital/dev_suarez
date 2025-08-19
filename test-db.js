const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Test query
    const categories = await prisma.projectCategory.findMany();
    console.log(`Found ${categories.length} categories`);
    console.log('Sample categories:', JSON.stringify(categories, null, 2));
    
  } catch (error) {
    console.error('❌ Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
