import type { Request } from 'express';
import { supabase } from '../../lib/supabase.js';
import { normalizePhone } from '../../lib/phone.js';
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  generateSessionToken,
  hashToken,
} from '../../lib/crypto.js';
import { logger } from '../../lib/logger.js';
import { badRequest, conflict, unauthorized, notFound } from '../../lib/errors.js';
import { env } from '../../config/env.js';

const OTP_TTL_MINUTES = 10;
const SESSION_TTL_DAYS = 30;
const MAX_OTP_ATTEMPTS = 5;

function dispatchOtp(phone: string, otp: string): void {
  if (env.SMS_DRIVER === 'console') {
    // DEV ONLY — never log OTPs in production
    if (env.NODE_ENV !== 'production') {
      logger.info(`📱 [DEV OTP] Phone: ${phone}  Code: ${otp}  (expires in ${OTP_TTL_MINUTES} min)`);
    }
  }
  // TODO: add SMS vendor adapter (Twilio / Termii / etc.) once vendor is chosen
  // See server/src/providers/sms/ for the adapter interface
}

export async function sendOtp(
  rawPhone: string,
  purpose: 'register' | 'login' | 'recovery',
  ip?: string
): Promise<void> {
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    throw badRequest(
      'Invalid phone number. Use Nigerian format: 08012345678 or +2348012345678'
    );
  }

  // Existence checks
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single();

  if (purpose === 'register' && existing) {
    throw conflict('An account with this phone number already exists. Please sign in instead.');
  }
  if ((purpose === 'login' || purpose === 'recovery') && !existing) {
    throw notFound('No account found with this phone number. Please register first.');
  }

  // Invalidate previous unused OTPs for this phone+purpose
  await supabase
    .from('otp_codes')
    .delete()
    .eq('phone', phone)
    .eq('purpose', purpose)
    .is('consumed_at', null);

  const otp = generateOtp();
  const codeHash = hashOtp(otp, phone);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();

  const { error } = await supabase.from('otp_codes').insert({
    phone,
    purpose,
    code_hash: codeHash,
    expires_at: expiresAt,
    ip: ip ?? null,
  });

  if (error) throw new Error(`Failed to store OTP: ${error.message}`);

  dispatchOtp(phone, otp);
}

export async function verifyOtp(
  rawPhone: string,
  code: string,
  purpose: 'register' | 'login' | 'recovery',
  req: Request
): Promise<{ user: Record<string, unknown>; token: string; isNewUser: boolean }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw badRequest('Invalid phone number.');

  // Fetch the latest unconsumed OTP
  const { data: otpRow } = await supabase
    .from('otp_codes')
    .select('id, code_hash, expires_at, attempts, consumed_at')
    .eq('phone', phone)
    .eq('purpose', purpose)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!otpRow) {
    throw unauthorized('No pending verification code found. Please request a new one.');
  }
  if ((otpRow.attempts as number) >= MAX_OTP_ATTEMPTS) {
    throw unauthorized('Too many failed attempts. Please request a new code.');
  }
  if (new Date(otpRow.expires_at as string) < new Date()) {
    throw unauthorized('Verification code has expired. Please request a new one.');
  }

  // Increment attempts before checking (prevents enumeration)
  await supabase
    .from('otp_codes')
    .update({ attempts: (otpRow.attempts as number) + 1 })
    .eq('id', otpRow.id);

  if (!verifyOtpHash(code, phone, otpRow.code_hash as string)) {
    throw unauthorized('Incorrect verification code. Please check and try again.');
  }

  // Mark consumed
  await supabase
    .from('otp_codes')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', otpRow.id);

  let isNewUser = false;
  let user: Record<string, unknown>;

  if (purpose === 'register') {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        phone,
        phone_verified_at: new Date().toISOString(),
        status: 'active',
      })
      .select()
      .single();
    if (error || !newUser) throw new Error('Failed to create account. Please try again.');
    user = newUser as Record<string, unknown>;
    isNewUser = true;
  } else {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    if (!existingUser) throw unauthorized('Account not found.');
    if ((existingUser as Record<string, unknown>).status !== 'active') {
      throw unauthorized('Your account has been suspended. Please contact support.');
    }
    user = existingUser as Record<string, unknown>;
  }

  // Create session
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60_000
  ).toISOString();

  await supabase.from('sessions').insert({
    user_id: user['id'],
    token_hash: tokenHash,
    ip: req.ip ?? null,
    user_agent: req.headers['user-agent'] ?? null,
    expires_at: expiresAt,
  });

  // Strip sensitive fields
  const { password_hash: _pw, ...safeUser } = user as {
    password_hash?: string;
    [key: string]: unknown;
  };

  return { user: safeUser, token, isNewUser };
}

export async function logout(sessionId: string): Promise<void> {
  await supabase
    .from('sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', sessionId);
}

export async function getMe(userId: string): Promise<Record<string, unknown>> {
  const { data: user } = await supabase
    .from('users')
    .select(
      'id, phone, display_name, email, avatar_url, bio, status, state, lga, town, country, onboarding_completed_at, terms_accepted_at, rating_avg, rating_count, completed_bookings, created_at'
    )
    .eq('id', userId)
    .single();
  if (!user) throw notFound('User');
  return user as Record<string, unknown>;
}
