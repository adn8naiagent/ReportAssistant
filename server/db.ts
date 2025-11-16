import { PrismaClient } from '@prisma/client';

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in environment variables');
  console.error('📝 To fix this:');
  console.error('   1. Click the lock icon 🔒 in Replit sidebar (Tools → Secrets)');
  console.error('   2. Add: DATABASE_URL = your Neon connection string');
  console.error('   3. Format: postgresql://user:password@host/dbname?sslmode=require');
  console.error('   4. Restart the server');
  throw new Error('DATABASE_URL must be set in environment variables');
}

// Log database URL (redacted for security)
const dbUrl = process.env.DATABASE_URL;
const redactedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
console.log(`🔗 Database URL configured: ${redactedUrl}`);

// PrismaClient singleton pattern to prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma client connected to database successfully');
  })
  .catch((err) => {
    console.error('❌ Prisma database connection failed:', err.message);
    console.error('📝 Troubleshooting:');
    console.error('   1. Verify DATABASE_URL in Replit Secrets is correct');
    console.error('   2. Check if database exists and is accessible');
    console.error('   3. Run: npm run db:push to create tables');
    console.error('   4. Check Neon dashboard for database status');
  });
