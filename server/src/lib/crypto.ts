import crypto from 'crypto';
import { env } from '../config/env.js';

/** Generate a cryptographically random session token (hex string). */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** SHA-256 hash of a token for safe storage in DB. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Generate a 6-digit cryptographically secure OTP. */
export function generateOtp(): string {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1_000_000;
  return num.toString().padStart(6, '0');
}

/** HMAC-SHA256 of otp+phone using OTP_HMAC_SECRET. */
export function hashOtp(otp: string, phone: string): string {
  return crypto
    .createHmac('sha256', env.OTP_HMAC_SECRET)
    .update(`${otp}:${phone}`)
    .digest('hex');
}

/** Timing-safe comparison of a submitted OTP against the stored HMAC. */
export function verifyOtpHash(otp: string, phone: string, storedHash: string): boolean {
  const expected = hashOtp(otp, phone);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  } catch {
    return false;
  }
}
