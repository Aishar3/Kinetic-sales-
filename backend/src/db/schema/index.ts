/**
 * Database Schema Definitions (Drizzle ORM)
 * 
 * Here we define our database tables in TypeScript. Drizzle ORM converts this
 * code into actual PostgreSQL tables inside our Supabase database.
 * 
 * Why code-first schemas?
 * 1. Readability: You can see your database structure right here in your editor.
 * 2. Autocomplete: TypeScript will know the exact type of every field (strings, numbers, dates).
 * 3. Migration tracking: Any changes we make here are tracked in version control (git).
 */

import { pgTable, uuid, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';

// ─── 1. LEADS TABLE ─────────────────────────────────────────────────────────
// Tracks potential customers, their contact details, and where they stand in 
// the sales pipeline (Sales Funnel).
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  
  // Pipeline status: 'new', 'contacted', 'qualified', 'proposal', 'won', 'lost'
  status: varchar('status', { length: 50 }).default('new').notNull(),
  
  // Deal value in cents (e.g., $100.00 is stored as 10000) to prevent decimal rounding errors
  estimatedValue: integer('estimated_value').default(0).notNull(),
  
  // Where did this lead come from? (e.g., 'referral', 'cold_call', 'website')
  source: varchar('source', { length: 100 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── 2. INTERACTIONS TABLE ──────────────────────────────────────────────────
// Logs every touchpoint with a lead (calls, emails, meetings, and raw notes).
// This forms the customer history.
export const interactions = pgTable('interactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Foreign Key: Links this interaction to a specific lead
  leadId: uuid('lead_id')
    .references(() => leads.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Type of interaction: 'call', 'email', 'meeting', 'note'
  type: varchar('type', { length: 50 }).notNull(),
  
  // Raw notes entered by the sales rep
  notes: text('notes').notNull(),
  
  // AI-generated summary from Gemini (synthesized key takeaways from meetings/calls)
  aiSummary: text('ai_summary'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 3. TASKS TABLE ─────────────────────────────────────────────────────────
// To-do list items linked to specific leads (e.g., "Send proposal", "Call back in 3 days").
// Keeps the sales associate organized and prevents deals from falling through the cracks.
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Foreign Key: Links this task to a specific lead
  leadId: uuid('lead_id')
    .references(() => leads.id, { onDelete: 'cascade' })
    .notNull(),
  
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  
  // Task status: 'pending', 'completed'
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});
