import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';
import { z } from 'zod';

const router = Router();

const submitVerificationSchema = z.object({
  type: z.enum(['identity', 'farmland', 'machinery', 'labour', 'training']),
  submitted_documents: z.array(z.string()).default([]),
});

// GET /api/verification — my verifications
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await supabase
      .from('verifications')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });
    res.json({ verifications: data ?? [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/verification — submit a verification request
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, submitted_documents } = submitVerificationSchema.parse(req.body);
    const { data } = await supabase
      .from('verifications')
      .insert({
        user_id: req.user!.id,
        type,
        submitted_documents,
        status: 'pending',
      })
      .select()
      .single();
    res.status(201).json({ verification: data });
  } catch (err) {
    next(err);
  }
});

export default router;
