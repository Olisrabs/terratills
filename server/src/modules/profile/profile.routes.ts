import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { updateProfileSchema, completeOnboardingSchema } from './profile.schema.js';
import * as profileService from './profile.service.js';

const router = Router();

function formatProfile(p: Record<string, unknown>) {
  return {
    ...p,
    name: p.display_name || p.phone,
    displayName: p.display_name || p.phone,
    location: {
      town: p.town || '',
      state: p.state || '',
      country: p.country || 'Nigeria',
    },
  };
}

// GET /api/profile
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = await profileService.getProfile(req.user!.id);
    const profile = formatProfile(raw);
    res.json({ profile, user: profile });
  } catch (err) {
    next(err);
  }
});

// Update profile handler (PATCH / or PUT /edit or POST /edit)
async function handleUpdateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const b = req.body;
    const updates: Record<string, unknown> = {};

    if (b.display_name !== undefined) updates.display_name = b.display_name;
    if (b.displayName !== undefined) updates.display_name = b.displayName;
    if (b.name !== undefined) updates.display_name = b.name;
    if (b.bio !== undefined) updates.bio = b.bio;
    if (b.avatar_url !== undefined) updates.avatar_url = b.avatar_url;
    if (b.email !== undefined) updates.email = b.email;
    if (b.state !== undefined) updates.state = b.state;
    if (b.town !== undefined) updates.town = b.town;
    if (b.location?.state !== undefined) updates.state = b.location.state;
    if (b.location?.town !== undefined) updates.town = b.location.town;
    if (b.location?.lga !== undefined) updates.lga = b.location.lga;

    const raw = await profileService.updateProfile(req.user!.id, updates);
    const profile = formatProfile(raw);
    res.json({ success: true, profile, user: profile });
  } catch (err) {
    next(err);
  }
}

router.patch('/', requireAuth, handleUpdateProfile);
router.put('/edit', requireAuth, handleUpdateProfile);
router.post('/edit', requireAuth, handleUpdateProfile);

// POST /api/profile/onboarding — complete onboarding wizard
router.post('/onboarding', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { terms_accepted: _accepted, ...data } = completeOnboardingSchema.parse(req.body);
    const raw = await profileService.completeOnboarding(req.user!.id, data);
    const profile = formatProfile(raw);
    res.json({ success: true, profile, user: profile });
  } catch (err) {
    next(err);
  }
});

export default router;
