import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';
import { z } from 'zod';

const router = Router();

const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  body: z.string().min(10, 'Please describe your issue in more detail').max(10000),
});

// GET /api/support/tickets
router.get('/tickets', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });
    res.json({ tickets: data ?? [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/support/tickets
router.post('/tickets', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, body } = createTicketSchema.parse(req.body);
    const { data } = await supabase
      .from('support_tickets')
      .insert({ user_id: req.user!.id, subject, body })
      .select()
      .single();
    res.status(201).json({ ticket: data });
  } catch (err) {
    next(err);
  }
});

export default router;
