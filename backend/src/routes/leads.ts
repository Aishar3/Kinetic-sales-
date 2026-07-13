import { Router } from 'express';
import { db } from '../config/database.js';
import { leads } from '../db/schema/index.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../middleware/request-logger.js';
import { desc, eq } from 'drizzle-orm';

const router = Router();

// Protect all lead routes with our Bouncer (requireAuth middleware)
router.use(requireAuth);

/**
 * 📋 1. GET ALL LEADS (GET /api/v1/leads)
 * 
 * In Plain English:
 * - When the admin dashboard opens, it asks the server for the list of leads.
 * - This code queries the PostgreSQL database, sorts them by creation date (newest first),
 *   and returns the list as JSON.
 */
router.get('/', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const allLeads = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt));

    res.status(200).json(allLeads);
  } catch (error) {
    logger.error({ error }, 'Error fetching leads');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not retrieve leads from the database.',
      },
    });
  }
});

/**
 * ➕ 2. CREATE A NEW LEAD (POST /api/v1/leads)
 * 
 * In Plain English:
 * - When the admin manually fills out the "Add New Lead" form in the dashboard,
 *   this code receives the data (name, email, budget) and inserts it into the database.
 */
router.post('/', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { name, company, email, phone, estimatedValue, source } = req.body;

    if (!name) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Lead name is required.',
        },
      });
      return;
    }

    const [newLead] = await db
      .insert(leads)
      .values({
        name,
        company: company || null,
        email: email || null,
        phone: phone || null,
        estimatedValue: estimatedValue ? parseInt(estimatedValue, 10) : 0,
        source: source || 'Manual Entry',
      })
      .returning();

    res.status(201).json(newLead);
  } catch (error) {
    logger.error({ error }, 'Error creating lead');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not save the lead to the database.',
      },
    });
  }
});

/**
 * 🔄 3. UPDATE LEAD STATUS (PATCH /api/v1/leads/:id/status)
 * 
 * In Plain English:
 * - When the admin moves a card in the Kanban board, this code updates the lead's status
 *   (e.g., from 'new' to 'contacted') in the database.
 */
router.patch('/:id/status', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['new', 'contacted', 'qualified', 'won', 'lost'];
    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
        },
      });
      return;
    }

    const [updatedLead] = await db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, id as string))
      .returning();

    if (!updatedLead) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found.',
        },
      });
      return;
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    logger.error({ error }, 'Error updating lead status');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not update lead status.',
      },
    });
  }
});

export default router;
