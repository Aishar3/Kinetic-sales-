import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { logger } from './request-logger.js';

// Extend Express Request type to include the user info we retrieve
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * The "Bouncer" Middleware (Require Authenticated User)
 * 
 * How it works:
 * 1. Checks if the incoming request has a "badge" (Authorization header with a Token).
 * 2. If no token is provided, it stops the request and returns a "401 Unauthorized" error.
 * 3. If there is a token, it asks Supabase: "Is this token valid?"
 * 4. If Supabase says yes, it saves the user's ID to the request and lets them pass to the database.
 * 5. If Supabase says no, it blocks them.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Look for the "Authorization" header in the request
    // It usually looks like: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is required. Please log in.',
        },
      });
      return;
    }

    // 2. Extract the actual token string (ignoring the word "Bearer")
    const token = authHeader.split(' ')[1];

    // 3. Ask Supabase to verify this token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Your login session has expired or is invalid. Please log in again.',
        },
      });
      return;
    }

    // 4. Attach the validated user details to the request object
    // This allows subsequent database queries to know WHO is asking for data
    req.user = {
      id: user.id,
      email: user.email,
    };

    // 5. Let the user proceed to the actual route handler (the database query)
    next();
  } catch (error) {
    logger.error({ error }, 'Authentication middleware error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during authentication.',
      },
    });
  }
}
