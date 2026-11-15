import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';
import { notFound, forbidden, badRequest } from '../../lib/errors.js';
import { toKobo, fromKobo } from '../../lib/money.js';

const router = Router();

// Helper to format listing object for frontend compatibility
function formatListing(l: Record<string, unknown>): Record<string, unknown> {
  const unitPriceKobo = Number(l.unit_price_kobo) || 0;
  return {
    ...l,
    id: l.id,
    status: l.status,
    title: l.title,
    price: fromKobo(unitPriceKobo),
    pricing_unit: l.pricing_model || 'per_day',
    location: {
      state: l.state,
      lga: l.lga,
      town: l.town,
    },
    gallery: l.images || [],
    category: l.category_slug,
  };
}

// GET /api/listings and /api/services — public browse & filter
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, state, q, status = 'active', page = '1', limit = '12' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

    let dbQuery = supabase
      .from('listings')
      .select('*, provider:users!listings_user_id_fkey(id, display_name, avatar_url, rating_avg, rating_count, completed_bookings, state, town)', { count: 'exact' });

    if (status !== 'all') {
      dbQuery = dbQuery.eq('status', status);
    }
    if (category) {
      dbQuery = dbQuery.eq('category_slug', category);
    }
    if (state) {
      dbQuery = dbQuery.eq('state', state);
    }
    if (q) {
      dbQuery = dbQuery.ilike('title', `%${q}%`);
    }

    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data, count, error } = await dbQuery.range(from, to).order('created_at', { ascending: false });
    if (error) throw error;

    const formatted = (data ?? []).map((item) => formatListing(item as Record<string, unknown>));

    // Calculate status counts for provider views
    const counts = {
      all: count ?? 0,
      active: formatted.filter(l => l.status === 'active').length,
      paused: formatted.filter(l => l.status === 'paused').length,
      draft: formatted.filter(l => l.status === 'draft').length,
    };

    res.json({
      listings: formatted,
      services: formatted,
      results: formatted,
      counts,
      total: count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/mine — my listings
router.get('/mine', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (data ?? []).map((item) => formatListing(item as Record<string, unknown>));
    const counts = {
      all: formatted.length,
      active: formatted.filter(l => l.status === 'active').length,
      paused: formatted.filter(l => l.status === 'paused').length,
      draft: formatted.filter(l => l.status === 'draft').length,
    };

    res.json({
      listings: formatted,
      services: formatted,
      counts,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/:id — single listing
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { data, error } = await supabase
      .from('listings')
      .select('*, provider:users!listings_user_id_fkey(id, display_name, avatar_url, rating_avg, rating_count, completed_bookings, state, town, bio)')
      .eq('id', id)
      .single();

    if (error || !data) throw notFound('Listing');

    // Async increment view count
    void supabase
      .from('listings')
      .update({ view_count: ((data as Record<string, unknown>)['view_count'] as number || 0) + 1 })
      .eq('id', id)
      .then(() => undefined);

    const formatted = formatListing(data as Record<string, unknown>);
    res.json({ listing: formatted, service: formatted });
  } catch (err) {
    next(err);
  }
});

// Helper for creation
async function handleCreateListing(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const b = req.body;

    const category_slug = b.category_slug || b.category;
    if (!['farmland', 'machinery', 'labour', 'training'].includes(category_slug)) {
      throw badRequest('Invalid category. Must be farmland, machinery, labour, or training.');
    }

    const title = b.title?.trim();
    if (!title || title.length < 3) {
      throw badRequest('Title must be at least 3 characters.');
    }

    // Price handling (converts Naira to integer kobo)
    let unit_price_kobo = 0;
    if (b.unit_price_kobo !== undefined) {
      unit_price_kobo = Number(b.unit_price_kobo);
    } else if (b.price !== undefined) {
      unit_price_kobo = toKobo(Number(b.price));
    }

    const state = b.state || b.location?.state || null;
    const lga = b.lga || b.location?.lga || null;
    const town = b.town || b.location?.town || null;
    const images = Array.isArray(b.gallery) ? b.gallery : (Array.isArray(b.images) ? b.images : []);
    const pricing_model = b.pricing_model || b.pricing_unit || 'fixed';
    const status = ['active', 'draft', 'pending_review', 'paused'].includes(b.status) ? b.status : 'pending_review';

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        user_id: userId,
        category_slug,
        title,
        description: b.description || '',
        pricing_model,
        unit_price_kobo,
        state,
        lga,
        town,
        attributes: b.attributes || {},
        images,
        status,
      })
      .select()
      .single();

    if (error || !listing) throw new Error(`Failed to create listing: ${error?.message}`);

    const formatted = formatListing(listing as Record<string, unknown>);
    res.status(201).json({ listing: formatted, service: formatted });
  } catch (err) {
    next(err);
  }
}

// POST /api/listings and POST /api/services/new
router.post('/', requireAuth, handleCreateListing);
router.post('/new', requireAuth, handleCreateListing);

// PATCH /api/listings/:id/status
router.patch('/:id/status', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;
    if (!['active', 'paused', 'draft'].includes(status)) {
      throw badRequest('Invalid status');
    }

    const { data: existing } = await supabase.from('listings').select('user_id').eq('id', id).single();
    if (!existing) throw notFound('Listing');
    if (existing.user_id !== req.user!.id) throw forbidden('You do not own this listing');

    const { data: updated, error } = await supabase
      .from('listings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) throw new Error('Failed to update status');

    const formatted = formatListing(updated as Record<string, unknown>);
    res.json({ listing: formatted, service: formatted });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/listings/:id
router.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const b = req.body;

    const { data: existing } = await supabase.from('listings').select('user_id, status').eq('id', id).single();
    if (!existing) throw notFound('Listing');
    if (existing.user_id !== req.user!.id) throw forbidden('You do not own this listing');

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (b.title !== undefined) updates.title = b.title;
    if (b.description !== undefined) updates.description = b.description;
    if (b.pricing_model !== undefined) updates.pricing_model = b.pricing_model;
    if (b.pricing_unit !== undefined) updates.pricing_model = b.pricing_unit;
    if (b.unit_price_kobo !== undefined) updates.unit_price_kobo = Number(b.unit_price_kobo);
    else if (b.price !== undefined) updates.unit_price_kobo = toKobo(Number(b.price));
    if (b.state !== undefined) updates.state = b.state;
    if (b.lga !== undefined) updates.lga = b.lga;
    if (b.town !== undefined) updates.town = b.town;
    if (b.attributes !== undefined) updates.attributes = b.attributes;
    if (b.gallery !== undefined) updates.images = b.gallery;
    if (b.images !== undefined) updates.images = b.images;
    if (b.status !== undefined) updates.status = b.status;

    const { data: updated, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) throw new Error('Failed to update listing');

    const formatted = formatListing(updated as Record<string, unknown>);
    res.json({ listing: formatted, service: formatted });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/listings/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { data: existing } = await supabase.from('listings').select('user_id').eq('id', id).single();
    if (!existing) throw notFound('Listing');
    if (existing.user_id !== req.user!.id) throw forbidden('You do not own this listing');

    await supabase.from('listings').delete().eq('id', id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
