/**
 * Supabase Client Configuration
 * 
 * WHY TWO CLIENTS?
 * - The "anon" client respects Row Level Security (RLS) rules.
 *   It acts like a regular user — it can only see data it's allowed to see.
 * - The "service role" client BYPASSES all RLS rules.
 *   It's used only for admin operations (like creating workspaces on signup).
 * 
 * SECURITY: The service role key is extremely powerful.
 * It must NEVER be exposed to the frontend or any client-side code.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Public client — respects Row Level Security
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Admin client — bypasses Row Level Security (use with extreme caution)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
