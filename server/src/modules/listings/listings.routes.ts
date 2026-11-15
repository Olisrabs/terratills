import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import {
  createListingSchema,
  updateListingSchema,
  listingsQuerySchema,
} from './listings.schema.js';
import * as listingsService from './listings.service.js';

const router = Router();

// GET /api/listings — public listing browse
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listingsQuerySchema.parse(req.query);
    const result = await listingsService.getListings(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/mine — my listings (authenticated)
router.get('/mine', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listings = await listingsService.getMyListings(req.user!.id);
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

// GET /api/listings/:id — single listing detail
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const listing = await listingsService.getListingById(id);
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// POST /api/listings — create a listing (authenticated)
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createListingSchema.parse(req.body);
    const listing = await listingsService.createListing(req.user!.id, data);
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/listings/:id — update a listing (authenticated + owner)
router.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updates = updateListingSchema.parse(req.body);
    const listing = await listingsService.updateListing(
      id,
      req.user!.id,
      updates as Record<string, unknown>
    );
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/listings/:id — delete a listing (authenticated + owner)
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await listingsService.deleteListing(id, req.user!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
