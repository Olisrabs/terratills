import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    res.json({ notifications: data ?? [] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read — mark single notification read
router.patch('/:id/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Mark all notifications read (PATCH /read-all or POST /mark-all-read)
async function handleMarkAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', req.user!.id)
      .is('read_at', null);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

router.patch('/read-all', requireAuth, handleMarkAllRead);
router.post('/mark-all-read', requireAuth, handleMarkAllRead);

export default router;
