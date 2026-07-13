/**
 * Centralized Error Handler
 * 
 * WHY CENTRALIZED ERROR HANDLING?
 * Instead of wrapping every route in try/catch blocks,
 * we have ONE place that catches all errors in the application.
 * 
 * This ensures:
 * - Every error response has the same consistent format
 * - Errors are always logged (nothing gets silently swallowed)
 * - Sensitive error details are hidden from users in production
 * - Different types of errors get appropriate HTTP status codes
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from './request-logger.js';

/**
 * Custom error class for application errors.
 * 
 * WHY A CUSTOM ERROR CLASS?
 * Regular JavaScript errors don't have HTTP status codes.
 * By creating our own AppError class, we can attach:
 * - A status code (404, 400, 500, etc.)
 * - An error code string ("NOT_FOUND", "VALIDATION_ERROR")
 * - Whether the error is "operational" (expected) or a bug
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    // This line ensures proper stack traces in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Express error-handling middleware.
 * This MUST have 4 parameters (err, req, res, next) — that's how
 * Express knows it's an error handler and not a regular middleware.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req as any).requestId || 'unknown';

  // If it's our custom AppError, use its status code and code
  if (err instanceof AppError) {
    logger.warn({
      requestId,
      errorCode: err.code,
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
    }, `Operational error: ${err.code}`);

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    });
    return;
  }

  // If it's an unexpected error (bug), log the full details but hide them from the user
  logger.error({
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  }, 'Unexpected server error');

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
      requestId,
    },
  });
}
