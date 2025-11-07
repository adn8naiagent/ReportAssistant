import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../shared/schema';

// Configure WebSocket for Node.js environment (required for Neon serverless)
neonConfig.webSocketConstructor = ws;

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not defined in environment variables. ' +
    'Please add DATABASE_URL to your .env file. ' +
    'Format: postgresql://user:password@host/dbname?sslmode=require'
  );
}

// Create Neon connection pool
const pool = new Pool({ connectionString: databaseUrl });

// Export configured drizzle instance with schema
export const db = drizzle(pool, { schema });
