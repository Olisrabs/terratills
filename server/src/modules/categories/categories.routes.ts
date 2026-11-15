import { Router, type Request, type Response, type NextFunction } from 'express';
import { supabase } from '../../lib/supabase.js';

const router = Router();

// GET /api/categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json({ categories: data ?? [] });
  } catch (err) {
    next(err);
  }
});

export default router;
