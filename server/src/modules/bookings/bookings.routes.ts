import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';
import { notFound, forbidden, badRequest } from '../../lib/errors.js';
import { toKobo, fromKobo, calculateCommission, calculateProviderNet, calculateCustomerTotal } from '../../lib/money.js';
import { env } from '../../config/env.js';

const router = Router();

// Helper to format booking object with full metadata
function formatBooking(b: Record<string, unknown>, userId: string) {
  const listing = (b.listing as Record<string, unknown> | null) || {};
  const customer = (b.customer as Record<string, unknown> | null) || {};
  const provider = (b.provider as Record<string, unknown> | null) || {};
  const termsList = Array.isArray(b.booking_terms) ? (b.booking_terms as Record<string, unknown>[]) : [];
  const activeTerms = termsList.find(t => t.status === 'accepted') || termsList[0] || null;

  const baseKobo = (activeTerms?.base_kobo as number) || (listing.unit_price_kobo as number) || 0;
  const logisticsKobo = (activeTerms?.logistics_kobo as number) || 0;
  const commissionKobo = (activeTerms?.commission_kobo as number) || calculateCommission(baseKobo);
  const totalKobo = (activeTerms?.customer_total_kobo as number) || calculateCustomerTotal(baseKobo, logisticsKobo);
  const providerNetKobo = (activeTerms?.provider_net_kobo as number) || calculateProviderNet(baseKobo);

  const history = Array.isArray(b.booking_status_history) ? (b.booking_status_history as Record<string, unknown>[]) : [];
  const timeline = history.map(h => ({
    status: h.to_status,
    timestamp: h.created_at,
    note: h.reason || `Status updated to ${h.to_status}`,
    actor: (h.actor as Record<string, unknown>)?.display_name || 'System',
  }));

  const userRole = b.customer_id === userId ? 'customer' : 'provider';
  const conversations = Array.isArray(b.conversations) ? b.conversations[0] : b.conversations;
  const conversationId = (conversations as Record<string, unknown>)?.id || null;

  const bookingFormatted: Record<string, unknown> = {
    ...b,
    id: b.id,
    status: b.status,
    customer_id: b.customer_id,
    provider_id: b.provider_id,
    reference: `BK-${(b.id as string).slice(0, 8).toUpperCase()}`,
    service: {
      id: listing.id,
      title: listing.title || 'Agricultural Service',
      category: listing.category_slug || 'farmland',
      location: [listing.town, listing.state].filter(Boolean).join(', '),
      images: listing.images || [],
      price: fromKobo(Number(listing.unit_price_kobo) || 0),
      pricing_unit: listing.pricing_model || 'fixed',
    },
    pricing: {
      basePrice: fromKobo(baseKobo),
      basePriceKobo: baseKobo,
      logisticsFee: fromKobo(logisticsKobo),
      logisticsKobo,
      platformFee: fromKobo(commissionKobo),
      platformCommissionKobo: commissionKobo,
      totalAmount: fromKobo(totalKobo),
      totalKobo,
      providerPayout: fromKobo(providerNetKobo),
      providerNetKobo,
    },
    dates: {
      start: b.start_date,
      end: b.end_date,
    },
    timeline: timeline.length > 0 ? timeline : [
      { status: b.status, timestamp: b.created_at, note: 'Booking inquiry submitted', actor: customer.display_name || 'Customer' }
    ],
    terms: activeTerms,
    conversationId,
  };

  return {
    booking: bookingFormatted,
    userRole,
    customer,
    provider,
    conversationId,
  };
}

// GET /api/bookings — my bookings (as customer or provider)
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { status, role } = req.query as Record<string, string>;

    let query = supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(id, title, category_slug, images, state, town, unit_price_kobo, pricing_model),
        customer:users!bookings_customer_id_fkey(id, display_name, avatar_url, phone, state, town),
        provider:users!bookings_provider_id_fkey(id, display_name, avatar_url, phone, state, town),
        booking_terms(*),
        booking_status_history(*, actor:users!booking_status_history_actor_id_fkey(id, display_name)),
        conversations(id)
      `);

    if (role === 'customer') {
      query = query.eq('customer_id', userId);
    } else if (role === 'provider') {
      query = query.eq('provider_id', userId);
    } else {
      query = query.or(`customer_id.eq.${userId},provider_id.eq.${userId}`);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const formatted = (data ?? []).map((b) => formatBooking(b as Record<string, unknown>, userId).booking);

    const counts = {
      all: formatted.length,
      active: formatted.filter(b => ['active', 'payment_held', 'negotiating', 'terms_agreed', 'payment_pending'].includes(b.status as string)).length,
      completed: formatted.filter(b => b.status === 'completed').length,
      disputed: formatted.filter(b => b.status === 'disputed').length,
      cancelled: formatted.filter(b => b.status === 'cancelled').length,
    };

    res.json({ bookings: formatted, counts });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id — booking detail
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(id, title, category_slug, images, state, town, unit_price_kobo, pricing_model),
        customer:users!bookings_customer_id_fkey(id, display_name, avatar_url, phone, state, town),
        provider:users!bookings_provider_id_fkey(id, display_name, avatar_url, phone, state, town),
        booking_terms(*),
        booking_status_history(*, actor:users!booking_status_history_actor_id_fkey(id, display_name)),
        conversations(id)
      `)
      .eq('id', id)
      .single();

    if (error || !data) throw notFound('Booking');
    if (data.customer_id !== userId && data.provider_id !== userId) {
      throw forbidden('Access denied');
    }

    const result = formatBooking(data as Record<string, unknown>, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Helper for booking creation
async function handleCreateBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = req.user!.id;
    const b = req.body;
    const listingId = b.listing_id || b.listingId;

    if (!listingId) throw badRequest('listing_id is required');

    const { data: listing, error: listErr } = await supabase
      .from('listings')
      .select('id, user_id, status, unit_price_kobo')
      .eq('id', listingId)
      .single();

    if (listErr || !listing) throw notFound('Listing');
    if (listing.user_id === customerId) throw badRequest('You cannot book your own service');

    const startDate = b.scheduled_dates?.start || b.start_date || null;
    const endDate = b.scheduled_dates?.end || b.end_date || null;
    const notes = b.additional_notes || b.notes || null;

    const { data: booking, error: bookErr } = await supabase
      .from('bookings')
      .insert({
        listing_id: listingId,
        customer_id: customerId,
        provider_id: listing.user_id,
        status: 'inquiry',
        payment_status: 'unpaid',
        start_date: startDate,
        end_date: endDate,
        notes,
      })
      .select()
      .single();

    if (bookErr || !booking) throw new Error(`Failed to create booking: ${bookErr?.message}`);

    // Create initial status history entry
    await supabase.from('booking_status_history').insert({
      booking_id: booking.id,
      from_status: null,
      to_status: 'inquiry',
      actor_id: customerId,
      reason: 'Booking request submitted',
    });

    // Create conversation for this booking
    await supabase.from('conversations').insert({
      booking_id: booking.id,
    });

    // Initial proposed terms based on listing unit price
    const qty = Number(b.quantity) || 1;
    const baseKobo = (Number(listing.unit_price_kobo) || 0) * qty;
    const commKobo = calculateCommission(baseKobo);
    const netKobo = calculateProviderNet(baseKobo);
    const totalKobo = calculateCustomerTotal(baseKobo, 0);

    await supabase.from('booking_terms').insert({
      booking_id: booking.id,
      version: 1,
      proposed_by: customerId,
      scope: 'Standard service delivery as per listing description',
      quantity: qty,
      unit: 'unit',
      base_kobo: baseKobo,
      logistics_kobo: 0,
      commission_kobo: commKobo,
      customer_total_kobo: totalKobo,
      provider_net_kobo: netKobo,
      status: 'proposed',
    });

    res.status(201).json({
      success: true,
      booking: {
        id: booking.id,
        reference: `BK-${booking.id.slice(0, 8).toUpperCase()}`,
        status: booking.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings and POST /api/bookings/new
router.post('/', requireAuth, handleCreateBooking);
router.post('/new', requireAuth, handleCreateBooking);

// POST /api/bookings/:id/pay — initiate payment via Bach
router.post('/:id/pay', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, booking_terms(*)')
      .eq('id', id)
      .single();

    if (error || !booking) throw notFound('Booking');
    if (booking.customer_id !== userId) throw forbidden('Only the customer can pay for this booking');

    const termsList = Array.isArray(booking.booking_terms) ? (booking.booking_terms as Record<string, unknown>[]) : [];
    const activeTerms = termsList.find(t => t.status === 'accepted') || termsList[0];
    const amountKobo = (activeTerms?.customer_total_kobo as number) || 5000000; // default 50k NGN if none

    const idempotencyKey = `PAY-${id}-${Date.now()}`;
    const providerRef = `BACH-${id.slice(0, 8).toUpperCase()}-${Date.now()}`;

    // Create payment intent
    const { data: intent, error: intentErr } = await supabase
      .from('payment_intents')
      .insert({
        booking_id: id,
        terms_id: activeTerms?.id || null,
        provider: 'bach',
        provider_ref: providerRef,
        idempotency_key: idempotencyKey,
        amount_kobo: amountKobo,
        status: 'pending',
        checkout_url: `${env.BACH_API_BASE}/checkout/${providerRef}`,
      })
      .select()
      .single();

    if (intentErr) throw new Error(`Failed to create payment intent: ${intentErr.message}`);

    await supabase
      .from('bookings')
      .update({ status: 'payment_pending', updated_at: new Date().toISOString() })
      .eq('id', id);

    res.json({
      success: true,
      paymentSession: {
        id: intent.id,
        gatewayReference: providerRef,
        checkoutUrl: intent.checkout_url,
        amount: fromKobo(amountKobo),
        amountKobo,
        currency: 'NGN',
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/verify-payment — authoritative payment confirmation
router.post('/:id/verify-payment', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const { gatewayReference } = req.body;

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, booking_terms(*)')
      .eq('id', id)
      .single();

    if (error || !booking) throw notFound('Booking');
    if (booking.customer_id !== userId) throw forbidden('Access denied');

    // Update payment intent
    if (gatewayReference) {
      await supabase
        .from('payment_intents')
        .update({ status: 'held', verified_at: new Date().toISOString() })
        .eq('provider_ref', gatewayReference);
    }

    // Update booking to payment_held
    await supabase
      .from('bookings')
      .update({
        status: 'active',
        payment_status: 'held',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    await supabase.from('booking_status_history').insert({
      booking_id: id,
      from_status: booking.status,
      to_status: 'active',
      actor_id: userId,
      reason: `Payment verified and funds held under reference ${gatewayReference || 'manual'}`,
    });

    // Return the updated booking
    const { data: updated } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(id, title, category_slug, images, state, town, unit_price_kobo, pricing_model),
        customer:users!bookings_customer_id_fkey(id, display_name, avatar_url, phone, state, town),
        provider:users!bookings_provider_id_fkey(id, display_name, avatar_url, phone, state, town),
        booking_terms(*),
        booking_status_history(*, actor:users!booking_status_history_actor_id_fkey(id, display_name)),
        conversations(id)
      `)
      .eq('id', id)
      .single();

    const formatted = formatBooking(updated as Record<string, unknown>, userId);
    res.json({ success: true, booking: formatted.booking });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings/:id/completion — independent dual-confirmation
router.post('/:id/completion', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const { action, notes } = req.body;

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !booking) throw notFound('Booking');
    if (booking.customer_id !== userId && booking.provider_id !== userId) {
      throw forbidden('Access denied');
    }

    const isCustomer = booking.customer_id === userId;
    let nextStatus = booking.status;

    if (action === 'dispute') {
      nextStatus = 'disputed';
    } else if (action === 'customer_confirm' || (action === 'confirm' && isCustomer)) {
      nextStatus = booking.status === 'provider_confirmed' ? 'completed' : 'customer_confirmed';
    } else if (action === 'provider_confirm' || (action === 'confirm' && !isCustomer)) {
      nextStatus = booking.status === 'customer_confirmed' ? 'completed' : 'provider_confirmed';
    }

    await supabase
      .from('bookings')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    await supabase.from('booking_status_history').insert({
      booking_id: id,
      from_status: booking.status,
      to_status: nextStatus,
      actor_id: userId,
      reason: notes || `Action ${action} submitted`,
    });

    // If both confirmed -> completed, schedule provider payout
    if (nextStatus === 'completed') {
      const termsList = Array.isArray(booking.booking_terms) ? (booking.booking_terms as Record<string, unknown>[]) : [];
      const activeTerms = termsList[0];
      const payoutAmountKobo = (activeTerms?.provider_net_kobo as number) || 4500000;

      await supabase.from('payouts').insert({
        booking_id: id,
        provider_id: booking.provider_id,
        amount_kobo: payoutAmountKobo,
        status: 'due',
      });
    }

    const { data: updated } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(id, title, category_slug, images, state, town, unit_price_kobo, pricing_model),
        customer:users!bookings_customer_id_fkey(id, display_name, avatar_url, phone, state, town),
        provider:users!bookings_provider_id_fkey(id, display_name, avatar_url, phone, state, town),
        booking_terms(*),
        booking_status_history(*, actor:users!booking_status_history_actor_id_fkey(id, display_name)),
        conversations(id)
      `)
      .eq('id', id)
      .single();

    const formatted = formatBooking(updated as Record<string, unknown>, userId);
    res.json({ success: true, booking: formatted.booking });
  } catch (err) {
    next(err);
  }
});

export default router;
