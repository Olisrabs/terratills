import { supabase } from '../../lib/supabase.js';
import { notFound } from '../../lib/errors.js';

const PROFILE_FIELDS =
  'id, phone, display_name, email, avatar_url, bio, state, lga, town, country, status, onboarding_completed_at, terms_accepted_at, rating_avg, rating_count, completed_bookings, created_at';

export async function getProfile(userId: string): Promise<Record<string, unknown>> {
  const { data } = await supabase
    .from('users')
    .select(PROFILE_FIELDS)
    .eq('id', userId)
    .single();
  if (!data) throw notFound('Profile');
  return data as Record<string, unknown>;
}

export async function updateProfile(
  userId: string,
  updates: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select(PROFILE_FIELDS)
    .single();
  if (error || !data) throw new Error('Failed to update profile.');
  return data as Record<string, unknown>;
}

export async function completeOnboarding(
  userId: string,
  payload: {
    display_name: string;
    state: string;
    lga: string;
    town: string;
    email?: string | null;
  }
): Promise<Record<string, unknown>> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('users')
    .update({
      display_name: payload.display_name,
      state: payload.state,
      lga: payload.lga,
      town: payload.town,
      email: payload.email ?? null,
      onboarding_completed_at: now,
      terms_accepted_at: now,
      updated_at: now,
    })
    .eq('id', userId)
    .select(PROFILE_FIELDS)
    .single();
  if (error || !data) throw new Error('Failed to complete onboarding.');
  return data as Record<string, unknown>;
}
