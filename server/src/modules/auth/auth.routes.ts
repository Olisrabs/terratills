import { Router, type Request, type Response, type NextFunction } from 'express';
import { sendOtpSchema, verifyOtpSchema } from './auth.schema.js';
import * as authService from './auth.service.js';
import { requireAuth } from '../../middleware/session.js';
import { env } from '../../config/env.js';

const router = Router();

const SESSION_COOKIE = 'tt_sid';
const SESSION_TTL_DAYS = 30;

function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/otp/send
router.post('/otp/send', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, purpose } = sendOtpSchema.parse(req.body);
    const { otp } = await authService.sendOtp(phone, purpose, req.ip);
    const payload: Record<string, unknown> = {
      success: true,
      message: 'Verification code sent to your phone.',
    };
    if (env.NODE_ENV !== 'production') {
      payload.devCode = otp;
    }
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/otp/verify
router.post('/otp/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, code, purpose } = verifyOtpSchema.parse(req.body);
    const { user, token, isNewUser } = await authService.verifyOtp(phone, code, purpose, req);
    setSessionCookie(res, token);
    res.json({ success: true, user, isNewUser });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — returns current session user
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({
      user,
      needsOnboarding: !user['onboarding_completed_at'],
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.sessionId!);
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ success: true, message: 'Signed out successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
