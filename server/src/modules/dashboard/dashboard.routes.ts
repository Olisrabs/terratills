import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';

const router = Router();

// GET /api/dashboard/overview
router.get('/overview', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [
      { data: bookingsAsCustomer },
      { data: bookingsAsProvider },
      { data: myListings },
      { data: unreadNotifs },
      { data: serviceRequests },
    ] = await Promise.all([
      supabase.from('bookings').select('id, status').eq('customer_id', userId),
      supabase.from('bookings').select('id, status').eq('provider_id', userId),
      supabase.from('listings').select('id, status').eq('user_id', userId),
      supabase.from('notifications').select('id').eq('user_id', userId).is('read_at', null),
      supabase.from('bookings').select('id').eq('provider_id', userId).eq('status', 'inquiry'),
    ]);

    const allBookings = [
      ...(bookingsAsCustomer ?? []),
      ...(bookingsAsProvider ?? []),
    ];

    const activeStatuses = ['active', 'payment_held', 'negotiating', 'terms_agreed', 'payment_pending'];

    res.json({
      overview: {
        totalBookings: allBookings.length,
        activeBookings: allBookings.filter((b: { status: string }) =>
          activeStatuses.includes(b.status)
        ).length,
        completedBookings: allBookings.filter(
          (b: { status: string }) => b.status === 'completed'
        ).length,
        pendingInquiries: (serviceRequests ?? []).length,
        myListings: (myListings ?? []).length,
        activeListings: (myListings ?? []).filter(
          (l: { status: string }) => l.status === 'active'
        ).length,
        unreadNotifications: (unreadNotifs ?? []).length,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
