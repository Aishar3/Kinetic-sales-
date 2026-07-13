/**
 * Kinetic Backend — Main Application Entry Point
 * 
 * This is where the server starts. It:
 * 1. Validates all environment variables (crashes early if something is missing)
 * 2. Sets up security middleware (helmet, cors, rate limiting)
 * 3. Mounts all API routes
 * 4. Starts listening for requests
 * 
 * STARTUP ORDER MATTERS:
 * - Environment validation FIRST (fail fast if misconfigured)
 * - Security middleware BEFORE routes (protect every endpoint)
 * - Error handler LAST (catches any errors from routes)
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { logger, requestLoggerMiddleware } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import routes from './routes/index.js';

// Create the Express application
const app = express();

// ─── SECURITY MIDDLEWARE ────────────────────────────────────────

// Helmet: adds security-related HTTP headers automatically
// (prevents common attacks like clickjacking, XSS, etc.)
app.use(helmet());

// CORS: controls which websites can make requests to your API
// In development, we allow all origins. In production, this will be locked down.
app.use(cors({
  origin: env.isDev ? true : [], // TODO: Add allowed origins for production
  credentials: true, // Allow cookies to be sent with requests
}));

// Rate Limiter: prevents any single IP from making too many requests
// Currently: max 100 requests per 15 minutes per IP address
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window
  standardHeaders: true,     // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
}));

// ─── REQUEST PARSING ────────────────────────────────────────────

// Parse JSON bodies (when someone sends JSON data to our API)
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent abuse

// ─── LOGGING ────────────────────────────────────────────────────

// Log every incoming request with a unique ID for tracing
app.use(requestLoggerMiddleware);

// ─── ROUTES ─────────────────────────────────────────────────────

// Mount all API routes under /api/v1
app.use('/api/v1', routes);

// ─── ERROR HANDLING ─────────────────────────────────────────────

// This MUST be the last middleware — it catches any errors from routes above
app.use(errorHandler);

// ─── START SERVER ───────────────────────────────────────────────

app.listen(env.PORT, () => {
  logger.info({
    port: env.PORT,
    environment: env.NODE_ENV,
  }, `🚀 Kinetic backend running on http://localhost:${env.PORT}`);
  logger.info(`📋 Health check: http://localhost:${env.PORT}/api/v1/health`);
});

export default app;
