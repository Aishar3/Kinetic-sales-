import { Router } from 'express';
import { db } from '../config/database.js';
import { tasks } from '../db/schema/index.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../middleware/request-logger.js';
import { desc, eq } from 'drizzle-orm';

const router = Router();

router.use(requireAuth);

/**
 * 📋 1. GET ALL TASKS (GET /api/v1/tasks)
 * 
 * In Plain English:
 * - Fetches all sales tasks from the database so the admin checklist displays them.
 */
router.get('/', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const allTasks = await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt));

    res.status(200).json(allTasks);
  } catch (error) {
    logger.error({ error }, 'Error fetching tasks');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not retrieve tasks.',
      },
    });
  }
});

/**
 * ➕ 2. CREATE A TASK (POST /api/v1/tasks)
 * 
 * In Plain English:
 * - Creates a new follow-up reminder linked to a specific customer lead.
 */
router.post('/', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { leadId, title, description, dueDate } = req.body;

    if (!leadId || !title) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Both leadId and title are required to create a task.',
        },
      });
      return;
    }

    const [newTask] = await db
      .insert(tasks)
      .values({
        leadId,
        title,
        description: description || null,
        status: 'pending',
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning();

    res.status(201).json(newTask);
  } catch (error) {
    logger.error({ error }, 'Error creating task');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not save the task.',
      },
    });
  }
});

/**
 * ✅ 3. TOGGLE TASK STATUS (PATCH /api/v1/tasks/:id/toggle)
 * 
 * In Plain English:
 * - Marks a task checklist item as completed or pending.
 */
router.patch('/:id/toggle', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'pending' && status !== 'completed') {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Status must be either "pending" or "completed".',
        },
      });
      return;
    }

    const completedAt = status === 'completed' ? new Date() : null;

    const [updatedTask] = await db
      .update(tasks)
      .set({ 
        status, 
        completedAt 
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!updatedTask) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found.',
        },
      });
      return;
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    logger.error({ error }, 'Error toggling task status');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not update task status.',
      },
    });
  }
});

export default router;
