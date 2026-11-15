import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';
import { hashToken } from '../lib/crypto.js';
import { logger } from '../lib/logger.js';

// Extend Express Request type to carry session user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone: string;
        display_name: string | null;
        email: string | null;
        avatar_url: string | null;
        status: string;
        onboarding_completed_at: string | null;
        state: string | null;
        lga: string | null;
        town: string | null;
        rating_avg: number;
        rating_count: number;
        completed_bookings: number;
      };
      sessionId?: string;
    }
  }
}

/** Reads tt_sid cookie, validates session in DB, attaches req.user. */
export async function sessionLoader(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.tt_sid as string | undefined;
  if (!token) return next();

  try {
    const tokenHash = hashToken(token);

    const { data: session } = await supabase
      .from('sessions')
      .select('id, user_id, expires_at, revoked_at')
      .eq('token_hash', tokenHash)
      .single();

    if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
      return next();
    }

    const { data: user } = await supabase
      .from('users')
      .select(
        'id, phone, display_name, email, avatar_url, status, onboarding_completed_at, state, lga, town, rating_avg, rating_count, completed_bookings'
      )
      .eq('id', session.user_id)
      .eq('status', 'active')
      .single();

    if (user) {
      req.user = user as typeof req.user;
      req.sessionId = session.id as string;

      // Fire-and-forget: update last seen
      void supabase
        .from('sessions')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', session.id)
        .then(() => undefined);
    }
  } catch (err) {
    logger.warn({ err }, 'Session loader error');
  }

  next();
}

/** Route middleware: 401 if no authenticated user. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthenticated. Please sign in.', code: 'UNAUTHORIZED' });
    return;
  }
  next();
}
