/**
 * Environment Variable Configuration
 * 
 * This file loads and validates all environment variables at startup.
 * If any required variable is missing, the server will refuse to start.
 * This prevents silent failures in production.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file from the backend root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Helper: read an env variable or throw if missing
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${name}. ` +
      `Check your .env file. See .env.example for reference.`
    );
  }
  return value;
}

/**
 * All environment variables used by Kinetic, validated at startup.
 * 
 * HOW IT WORKS (plain English):
 * - When the server starts, this code reads your .env file
 * - If any required value is missing, the server stops immediately with a clear error
 * - This prevents the app from running in a broken state
 */
export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Supabase - for authentication
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // Database - direct PostgreSQL connection for Drizzle ORM
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // Gemini AI
  GEMINI_API_KEY: requireEnv('GEMINI_API_KEY'),

  // Computed
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;
