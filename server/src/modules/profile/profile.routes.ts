import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { updateProfileSchema, completeOnboardingSchema } from './profile.schema.js';
import * as profileService from './profile.service.js';

const router = Router();

// GET /api/profile
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/profile
router.patch('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = updateProfileSchema.parse(req.body);
    const profile = await profileService.updateProfile(
      req.user!.id,
      updates as Record<string, unknown>
    );
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

// POST /api/profile/onboarding — complete onboarding wizard
router.post('/onboarding', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { terms_accepted: _accepted, ...data } = completeOnboardingSchema.parse(req.body);
    const profile = await profileService.completeOnboarding(req.user!.id, data);
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});

export default router;
