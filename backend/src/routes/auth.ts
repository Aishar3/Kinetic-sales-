import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { logger } from '../middleware/request-logger.js';

const router = Router();

/**
 * 🔑 1. USER SIGNUP ROUTE (POST /api/v1/auth/signup)
 * 
 * In Plain English:
 * - A new user fills in their email and password on our website.
 * - This code receives that information.
 * - It passes it to Supabase Auth to securely store the password (using high-level encryption).
 * - It returns a confirmation.
 */
router.post('/signup', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Basic validation: make sure they actually typed an email and password
    if (!email || !password) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Both email and password are required to sign up.',
        },
      });
      return;
    }

    // Call Supabase Auth to create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      res.status(400).json({
        error: {
          code: 'SIGNUP_FAILED',
          message: error.message,
        },
      });
      return;
    }

    res.status(201).json({
      message: 'Signup successful! Please check your email for a verification link.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Signup error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during signup.',
      },
    });
  }
});

/**
 * 🔓 2. USER LOGIN ROUTE (POST /api/v1/auth/login)
 * 
 * In Plain English:
 * - A registered user enters their email and password.
 * - This code checks if the credentials match what Supabase Auth has on file.
 * - If correct, Supabase generates a security "Session Token" (like a key card).
 * - We return this session token to the user's browser, which will use it to access protected areas.
 */
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Both email and password are required to log in.',
        },
      });
      return;
    }

    // Call Supabase Auth to verify credentials and log the user in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(400).json({
        error: {
          code: 'LOGIN_FAILED',
          message: error.message,
        },
      });
      return;
    }

    // Return the session tokens (access_token is the key card)
    res.status(200).json({
      message: 'Login successful!',
      session: {
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        expiresIn: data.session?.expires_in, // Time before the key card expires (in seconds)
      },
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Login error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during login.',
      },
    });
  }
});

export default router;
