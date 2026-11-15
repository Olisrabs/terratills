import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

/** Normalize a raw phone number to E.164 format for Nigeria. Returns null if invalid. */
export function normalizePhone(raw: string): string | null {
  try {
    const parsed = parsePhoneNumberFromString(raw.trim(), 'NG');
    if (!parsed || !parsed.isValid()) return null;
    return parsed.format('E.164'); // e.g. +2348012345678
  } catch {
    return null;
  }
}

export function isValidNigerianPhone(raw: string): boolean {
  try {
    return isValidPhoneNumber(raw.trim(), 'NG');
  } catch {
    return false;
  }
}
