import { Router } from 'express';
import { db } from '../config/database.js';
import { interactions } from '../db/schema/index.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../middleware/request-logger.js';
import { desc, eq } from 'drizzle-orm';

const router = Router();

router.use(requireAuth);

/**
 * 📋 1. GET ALL INTERACTIONS FOR A LEAD (GET /api/v1/interactions/lead/:leadId)
 * 
 * In Plain English:
 * - Fetches all chats, calls, and manual sales logs for a single customer.
 */
router.get('/lead/:leadId', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { leadId } = req.params;

    const leadInteractions = await db
      .select()
      .from(interactions)
      .where(eq(interactions.leadId, leadId as string))
      .orderBy(desc(interactions.createdAt));

    res.status(200).json(leadInteractions);
  } catch (error) {
    logger.error({ error }, 'Error fetching interactions');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not retrieve customer history.',
      },
    });
  }
});

/**
 * ➕ 2. CREATE A NEW INTERACTION RECORD (POST /api/v1/interactions)
 * 
 * In Plain English:
 * - Saves a new event (like a manual sales call summary or email note) to a customer's profile history.
 */
router.post('/', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { leadId, type, notes, aiSummary } = req.body;

    const allowedTypes = ['call', 'email', 'meeting', 'note', 'chat'];
    if (!leadId || !type || !notes) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'leadId, type, and notes are required fields.',
        },
      });
      return;
    }

    if (!allowedTypes.includes(type)) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid interaction type. Must be one of: ${allowedTypes.join(', ')}`,
        },
      });
      return;
    }

    const [newInteraction] = await db
      .insert(interactions)
      .values({
        leadId,
        type,
        notes,
        aiSummary: aiSummary || null,
      })
      .returning();

    res.status(201).json(newInteraction);
  } catch (error) {
    logger.error({ error }, 'Error creating interaction');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not record history event.',
      },
    });
  }
});

export default router;
