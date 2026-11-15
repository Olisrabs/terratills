import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import {
  createBookingSchema,
  proposeTermsSchema,
  bookingActionSchema,
} from './bookings.schema.js';
import * as bookingsService from './bookings.service.js';

const router = Router();

// GET /api/bookings — my bookings (as customer or provider)
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await bookingsService.getMyBookings(req.user!.id);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id — booking detail
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const booking = await bookingsService.getBookingById(id, req.user!.id);
    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings — create booking inquiry
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listing_id, notes, start_date, end_date } = createBookingSchema.parse(req.body);
    const booking = await bookingsService.createBooking(
      req.user!.id,
      listing_id,
      notes,
      start_date,
      end_date
    );
    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/terms — propose booking terms
router.post('/:id/terms', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const terms = proposeTermsSchema.parse(req.body);
    const result = await bookingsService.proposeTerms(id, req.user!.id, terms);
    res.status(201).json({ terms: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/action — perform booking action
router.post('/:id/action', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { action, reason, terms_id } = bookingActionSchema.parse(req.body);
    const booking = await bookingsService.performBookingAction(
      id,
      req.user!.id,
      action,
      reason,
      terms_id
    );
    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

export default router;
