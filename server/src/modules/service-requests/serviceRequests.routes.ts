import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../../middleware/session.js';
import { supabase } from '../../lib/supabase.js';
import { notFound, forbidden, badRequest } from '../../lib/errors.js';
import { toKobo, calculateCommission, calculateProviderNet, calculateCustomerTotal } from '../../lib/money.js';

const router = Router();

// GET /api/service-requests — incoming booking inquiries for the provider
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id, status, created_at, updated_at, start_date, end_date, notes,
        listing:listings(id, title, category_slug, unit_price_kobo, pricing_model, state, town),
        customer:users!bookings_customer_id_fkey(id, display_name, phone, state, town, avatar_url),
        booking_terms(*)
      `)
      .eq('provider_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedRequests = (bookings ?? []).map((b: Record<string, unknown>) => {
      const listing = b.listing as Record<string, unknown> | null;
      const customer = b.customer as Record<string, unknown> | null;
      const terms = Array.isArray(b.booking_terms) ? (b.booking_terms[0] as Record<string, unknown> | undefined) : undefined;
      const basePriceKobo = (terms?.base_kobo as number) || (listing?.unit_price_kobo as number) || 0;

      return {
        id: b.id,
        reference: `SR-${(b.id as string).slice(0, 8).toUpperCase()}`,
        status: b.status,
        service_title: listing?.title || 'Agricultural Service',
        category: listing?.category_slug || 'farmland',
        customer_name: customer?.display_name || 'Customer',
        customer_phone: customer?.phone || '',
        customer_location: [customer?.town, customer?.state].filter(Boolean).join(', '),
        proposed_amount: Math.round(basePriceKobo / 100),
        proposed_amount_kobo: basePriceKobo,
        scheduled_date: b.start_date || 'Flexible',
        notes: b.notes || '',
        created_at: b.created_at,
      };
    });

    const counts = {
      all: formattedRequests.length,
      pending: formattedRequests.filter(r => r.status === 'inquiry').length,
      negotiating: formattedRequests.filter(r => r.status === 'negotiating').length,
      agreed: formattedRequests.filter(r => ['terms_agreed', 'payment_pending', 'payment_held'].includes(r.status as string)).length,
    };

    res.json({ requests: formattedRequests, counts });
  } catch (err) {
    next(err);
  }
});

// POST /api/service-requests/:id/respond
router.post('/:id/respond', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { action, message, revised_amount } = req.body;

    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('id, provider_id, customer_id, status, listing_id')
      .eq('id', requestId)
      .single();

    if (fetchErr || !booking) throw notFound('Service request');
    if (booking.provider_id !== userId) throw forbidden('Access denied');

    if (action === 'accept') {
      await supabase
        .from('bookings')
        .update({ status: 'terms_agreed', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      await supabase.from('booking_status_history').insert({
        booking_id: requestId,
        from_status: booking.status,
        to_status: 'terms_agreed',
        actor_id: userId,
        reason: message || 'Provider accepted inquiry terms',
      });
    } else if (action === 'decline') {
      await supabase
        .from('bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      await supabase.from('booking_status_history').insert({
        booking_id: requestId,
        from_status: booking.status,
        to_status: 'cancelled',
        actor_id: userId,
        reason: message || 'Provider declined request',
      });
    } else if (action === 'revise') {
      if (!revised_amount || revised_amount <= 0) {
        throw badRequest('Revised amount must be greater than zero');
      }
      const baseKobo = toKobo(Number(revised_amount));
      const commKobo = calculateCommission(baseKobo);
      const netKobo = calculateProviderNet(baseKobo);
      const totalKobo = calculateCustomerTotal(baseKobo, 0);

      await supabase
        .from('booking_terms')
        .update({ status: 'superseded' })
        .eq('booking_id', requestId)
        .eq('status', 'proposed');

      await supabase.from('booking_terms').insert({
        booking_id: requestId,
        version: 1,
        proposed_by: userId,
        scope: message || 'Revised quotation',
        quantity: 1,
        unit: 'service',
        base_kobo: baseKobo,
        logistics_kobo: 0,
        commission_kobo: commKobo,
        customer_total_kobo: totalKobo,
        provider_net_kobo: netKobo,
        status: 'proposed',
      });

      await supabase
        .from('bookings')
        .update({ status: 'negotiating', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      await supabase.from('booking_status_history').insert({
        booking_id: requestId,
        from_status: booking.status,
        to_status: 'negotiating',
        actor_id: userId,
        reason: `Provider proposed revised quote of ₦${Number(revised_amount).toLocaleString()}`,
      });
    }

    res.json({ success: true, message: `Request successfully marked as ${action}` });
  } catch (err) {
    next(err);
  }
});

export default router;
