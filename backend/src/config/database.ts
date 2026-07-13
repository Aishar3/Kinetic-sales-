/**
 * Database Connection (Drizzle ORM)
 * 
 * WHY DRIZZLE + DIRECT POSTGRES CONNECTION?
 * Instead of using Supabase's API to query the database,
 * we connect directly to PostgreSQL. This gives us:
 * - Full SQL control for complex queries
 * - Type-safe queries (TypeScript knows exactly what data looks like)
 * - Better performance (no extra API layer in between)
 * - Database migrations (version-controlled schema changes)
 * 
 * Think of it like this:
 * - Supabase Auth = handles login/signup
 * - Direct Postgres + Drizzle = handles all data storage and retrieval
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env.js';
import { logger } from '../middleware/request-logger.js';

// Create the raw PostgreSQL connection
// max: 10 means we allow up to 10 simultaneous database connections
// This prevents overwhelming the database with too many connections
const connectionString = env.DATABASE_URL;
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Wrap the connection with Drizzle ORM for type-safe queries
export const db = drizzle(client);

/**
 * Test the database connection.
 * Called once at startup to verify we can reach the database.
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1 as connected`;
    logger.info('✅ Database connection established successfully');
    return true;
  } catch (error) {
    logger.error({ error }, '❌ Failed to connect to database');
    return false;
  }
}
