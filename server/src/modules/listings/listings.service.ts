import { supabase } from '../../lib/supabase.js';
import { notFound, forbidden, badRequest } from '../../lib/errors.js';

const PROVIDER_FIELDS =
  'id, display_name, avatar_url, rating_avg, rating_count, completed_bookings, state, town';

export async function getListings(query: {
  category?: string;
  state?: string;
  q?: string;
  page: number;
  limit: number;
  status: string;
}): Promise<{ listings: unknown[]; total: number; page: number; limit: number }> {
  let dbQuery = supabase
    .from('listings')
    .select(
      `*, provider:users!listings_user_id_fkey(${PROVIDER_FIELDS})`,
      { count: 'exact' }
    )
    .eq('status', query.status);

  if (query.category) dbQuery = dbQuery.eq('category_slug', query.category);
  if (query.state) dbQuery = dbQuery.eq('state', query.state);
  if (query.q) dbQuery = dbQuery.ilike('title', `%${query.q}%`);

  const from = (query.page - 1) * query.limit;
  const to = from + query.limit - 1;

  const { data, count, error } = await dbQuery
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    listings: data ?? [],
    total: count ?? 0,
    page: query.page,
    limit: query.limit,
  };
}

export async function getListingById(id: string): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `*, provider:users!listings_user_id_fkey(id, display_name, avatar_url, rating_avg, rating_count, completed_bookings, state, town, bio)`
    )
    .eq('id', id)
    .single();

  if (error || !data) throw notFound('Listing');

  // Increment view count asynchronously
  void supabase
    .from('listings')
    .update({ view_count: ((data as Record<string, unknown>)['view_count'] as number || 0) + 1 })
    .eq('id', id)
    .then(() => undefined);

  return data as Record<string, unknown>;
}

export async function createListing(
  userId: string,
  data: {
    category_slug: string;
    title: string;
    description?: string;
    pricing_model: string;
    unit_price_kobo: number;
    state?: string;
    lga?: string;
    town?: string;
    attributes: Record<string, unknown>;
  }
): Promise<Record<string, unknown>> {
  const { data: listing, error } = await supabase
    .from('listings')
    .insert({ ...data, user_id: userId, status: 'pending_review' })
    .select()
    .single();

  if (error || !listing) throw new Error('Failed to create listing.');
  return listing as Record<string, unknown>;
}

export async function updateListing(
  listingId: string,
  userId: string,
  updates: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data: existing } = await supabase
    .from('listings')
    .select('user_id, status')
    .eq('id', listingId)
    .single();

  if (!existing) throw notFound('Listing');
  if ((existing as Record<string, unknown>)['user_id'] !== userId) {
    throw forbidden('You do not own this listing.');
  }
  if ((existing as Record<string, unknown>)['status'] === 'suspended') {
    throw badRequest('Suspended listings cannot be edited.');
  }

  const { data, error } = await supabase
    .from('listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', listingId)
    .select()
    .single();

  if (error || !data) throw new Error('Failed to update listing.');
  return data as Record<string, unknown>;
}

export async function deleteListing(listingId: string, userId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', listingId)
    .single();

  if (!existing) throw notFound('Listing');
  if ((existing as Record<string, unknown>)['user_id'] !== userId) {
    throw forbidden('You do not own this listing.');
  }

  await supabase.from('listings').delete().eq('id', listingId);
}

export async function getMyListings(userId: string): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
