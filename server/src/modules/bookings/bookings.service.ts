import { supabase } from '../../lib/supabase.js';
import { notFound, forbidden, badRequest } from '../../lib/errors.js';
import {
  calculateCommission,
  calculateProviderNet,
  calculateCustomerTotal,
} from '../../lib/money.js';

export async function createBooking(
  customerId: string,
  listingId: string,
  notes?: string,
  startDate?: string,
  endDate?: string
): Promise<Record<string, unknown>> {
  const { data: listing } = await supabase
    .from('listings')
    .select('id, user_id, status')
    .eq('id', listingId)
    .single();

  if (!listing) throw notFound('Listing');
  if ((listing as Record<string, unknown>)['status'] !== 'active') {
    throw badRequest('This listing is not currently available for booking.');
  }
  if ((listing as Record<string, unknown>)['user_id'] === customerId) {
    throw badRequest('You cannot book your own listing.');
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      listing_id: listingId,
      customer_id: customerId,
      provider_id: (listing as Record<string, unknown>)['user_id'],
      status: 'inquiry',
      payment_status: 'unpaid',
      notes: notes ?? null,
      start_date: startDate ?? null,
      end_date: endDate ?? null,
    })
    .select()
    .single();

  if (error || !booking) throw new Error('Failed to create booking.');

  // Record initial status history
  await supabase.from('booking_status_history').insert({
    booking_id: (booking as Record<string, unknown>)['id'],
    from_status: null,
    to_status: 'inquiry',
    actor_id: customerId,
    reason: 'Booking inquiry submitted',
  });

  // Create a conversation thread for this booking
  await supabase.from('conversations').insert({
    booking_id: (booking as Record<string, unknown>)['id'],
  });

  return booking as Record<string, unknown>;
}

export async function getMyBookings(userId: string): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `*, 
       listing:listings(id, title, category_slug, images, state, town),
       customer:users!bookings_customer_id_fkey(id, display_name, avatar_url),
       provider:users!bookings_provider_id_fkey(id, display_name, avatar_url)`
    )
    .or(`customer_id.eq.${userId},provider_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBookingById(
  bookingId: string,
  userId: string
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `*,
       listing:listings(id, title, category_slug, images, state, town, unit_price_kobo, pricing_model),
       customer:users!bookings_customer_id_fkey(id, display_name, avatar_url, phone, state, town),
       provider:users!bookings_provider_id_fkey(id, display_name, avatar_url, phone, state, town),
       booking_terms(*),
       booking_status_history(*, actor:users!booking_status_history_actor_id_fkey(id, display_name)),
       conversations(id)`
    )
    .eq('id', bookingId)
    .single();

  if (error || !data) throw notFound('Booking');
  const b = data as Record<string, unknown>;
  if (b['customer_id'] !== userId && b['provider_id'] !== userId) {
    throw forbidden('Access denied.');
  }

  return b;
}

export async function proposeTerms(
  bookingId: string,
  userId: string,
  terms: {
    scope: string;
    quantity: number;
    unit: string;
    base_kobo: number;
    logistics_kobo: number;
  }
): Promise<Record<string, unknown>> {
  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_id, provider_id, status')
    .eq('id', bookingId)
    .single();

  if (!booking) throw notFound('Booking');
  const b = booking as Record<string, unknown>;
  if (b['customer_id'] !== userId && b['provider_id'] !== userId) {
    throw forbidden('Access denied.');
  }
  if (!['inquiry', 'negotiating'].includes(b['status'] as string)) {
    throw badRequest('Cannot propose terms at this booking stage.');
  }

  const commissionKobo = calculateCommission(terms.base_kobo);
  const providerNetKobo = calculateProviderNet(terms.base_kobo);
  const customerTotalKobo = calculateCustomerTotal(terms.base_kobo, terms.logistics_kobo);

  // Supersede previous proposed terms
  await supabase
    .from('booking_terms')
    .update({ status: 'superseded' })
    .eq('booking_id', bookingId)
    .eq('status', 'proposed');

  const { count } = await supabase
    .from('booking_terms')
    .select('id', { count: 'exact' })
    .eq('booking_id', bookingId);

  const { data: newTerms, error } = await supabase
    .from('booking_terms')
    .insert({
      booking_id: bookingId,
      version: (count ?? 0) + 1,
      proposed_by: userId,
      scope: terms.scope,
      quantity: terms.quantity,
      unit: terms.unit,
      base_kobo: terms.base_kobo,
      logistics_kobo: terms.logistics_kobo,
      commission_kobo: commissionKobo,
      customer_total_kobo: customerTotalKobo,
      provider_net_kobo: providerNetKobo,
      status: 'proposed',
    })
    .select()
    .single();

  if (error || !newTerms) throw new Error('Failed to propose terms.');

  await supabase
    .from('bookings')
    .update({ status: 'negotiating', updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  return newTerms as Record<string, unknown>;
}

export async function performBookingAction(
  bookingId: string,
  userId: string,
  action: string,
  reason?: string,
  termsId?: string
): Promise<Record<string, unknown>> {
  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_id, provider_id, status')
    .eq('id', bookingId)
    .single();

  if (!booking) throw notFound('Booking');
  const b = booking as Record<string, unknown>;
  if (b['customer_id'] !== userId && b['provider_id'] !== userId) {
    throw forbidden('Access denied.');
  }

  const currentStatus = b['status'] as string;
  let newStatus: string | null = null;

  switch (action) {
    case 'accept_terms':
      if (currentStatus !== 'negotiating') {
        throw badRequest('Cannot accept terms at this stage.');
      }
      if (!termsId) throw badRequest('terms_id is required.');
      await supabase
        .from('booking_terms')
        .update({ status: 'accepted' })
        .eq('id', termsId)
        .eq('booking_id', bookingId);
      newStatus = 'terms_agreed';
      break;

    case 'reject_terms':
      if (currentStatus !== 'negotiating') {
        throw badRequest('Cannot reject terms at this stage.');
      }
      if (termsId) {
        await supabase
          .from('booking_terms')
          .update({ status: 'rejected' })
          .eq('id', termsId)
          .eq('booking_id', bookingId);
      }
      newStatus = 'inquiry';
      break;

    case 'cancel':
      if (['completed', 'cancelled', 'refunded'].includes(currentStatus)) {
        throw badRequest('Booking cannot be cancelled at this stage.');
      }
      newStatus = 'cancelled';
      break;

    case 'confirm_completion':
      if (!['active', 'customer_confirmed', 'provider_confirmed'].includes(currentStatus)) {
        throw badRequest('Cannot confirm completion at this stage.');
      }
      if (userId === b['customer_id']) {
        newStatus =
          currentStatus === 'provider_confirmed' ? 'completed' : 'customer_confirmed';
      } else {
        newStatus =
          currentStatus === 'customer_confirmed' ? 'completed' : 'provider_confirmed';
      }
      break;

    case 'raise_dispute':
      if (!['active', 'customer_confirmed', 'provider_confirmed'].includes(currentStatus)) {
        throw badRequest('Cannot raise a dispute at this stage.');
      }
      newStatus = 'disputed';
      break;

    default:
      throw badRequest('Unknown action.');
  }

  if (newStatus) {
    await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    await supabase.from('booking_status_history').insert({
      booking_id: bookingId,
      from_status: currentStatus,
      to_status: newStatus,
      actor_id: userId,
      reason: reason ?? null,
    });
  }

  const { data: updated } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  return updated as Record<string, unknown>;
}
