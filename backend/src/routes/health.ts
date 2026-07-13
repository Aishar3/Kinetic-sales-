/**
 * Health Check Route
 * 
 * WHY A HEALTH CHECK?
 * When your server is running in the cloud (Render, Railway, etc.),
 * the hosting platform needs to know if your server is alive and working.
 * It does this by periodically calling this endpoint.
 * 
 * If this endpoint returns "healthy", the platform knows the server is fine.
 * If it returns "unhealthy" or doesn't respond, the platform restarts the server.
 * 
 * Our health check tests TWO things:
 * 1. Can the server respond to requests? (basic)
 * 2. Can the server connect to the database? (critical)
 */

import { Router } from 'express';
import { testDatabaseConnection } from '../config/database.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const dbConnected = await testDatabaseConnection();

  const status = dbConnected ? 'healthy' : 'degraded';
  const httpStatus = dbConnected ? 200 : 503;

  res.status(httpStatus).json({
    status,
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    checks: {
      database: dbConnected ? 'connected' : 'disconnected',
    },
  });
});

export default router;
