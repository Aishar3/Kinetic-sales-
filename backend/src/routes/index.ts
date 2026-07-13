/**
 * Route Aggregator
 * 
 * This file collects all route modules and mounts them under /api/v1.
 * As we add new features (auth, chat, contacts), each gets its own
 * route file that we import and mount here.
 * 
 * This keeps the main app.ts clean and makes routes easy to find.
 */

import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import leadsRoutes from './leads.js';
import tasksRoutes from './tasks.js';
import interactionsRoutes from './interactions.js';

const router = Router();

// Mount health check at /api/v1/health
router.use(healthRoutes);

// Mount auth routes at /api/v1/auth
router.use('/auth', authRoutes);

// Mount database management routes
router.use('/leads', leadsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/interactions', interactionsRoutes);

export default router;
