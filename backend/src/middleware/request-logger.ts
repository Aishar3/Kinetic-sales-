/**
 * Structured Request Logger
 * 
 * WHY STRUCTURED LOGGING?
 * Instead of plain text logs like "User logged in",
 * structured logs output JSON: { "event": "user_login", "userId": "123", "timestamp": "..." }
 * 
 * This matters because:
 * - Log analysis tools (like Datadog, Grafana) can search and filter JSON logs
 * - You can trace a single request through the entire system using a requestId
 * - When something breaks at 3am, you can find the exact request that failed
 * 
 * PINO is the fastest Node.js logger. It outputs JSON in production
 * and pretty-printed text in development (so you can actually read it).
 */

import pino from 'pino';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Create the base logger
// In development: pretty-printed, colorful output
// In production: raw JSON (for log analysis tools)
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

/**
 * Middleware that logs every incoming HTTP request.
 * Also assigns a unique requestId to each request for tracing.
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Generate a unique ID for this request (for tracing through logs)
  const requestId = crypto.randomUUID();
  
  // Attach the requestId to the request object so other code can use it
  (req as any).requestId = requestId;
  
  // Record when the request started
  const startTime = Date.now();

  // When the response finishes, log the complete request details
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
    }, `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });

  next();
}
