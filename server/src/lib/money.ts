/**
 * All money values MUST be stored and computed as integer kobo (1 NGN = 100 kobo).
 * No floats anywhere in money code.
 */

export const COMMISSION_RATE = 0.05; // 5% provider commission; 0% customer markup

export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function fromKobo(kobo: number): number {
  return kobo / 100;
}

export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(fromKobo(kobo));
}

/** Commission deducted from provider's base amount. */
export function calculateCommission(baseKobo: number): number {
  return Math.round(baseKobo * COMMISSION_RATE);
}

/** What the provider receives after commission. */
export function calculateProviderNet(baseKobo: number): number {
  return baseKobo - calculateCommission(baseKobo);
}

/** What the customer pays (0% markup, logistics added separately). */
export function calculateCustomerTotal(baseKobo: number, logisticsKobo = 0): number {
  return baseKobo + logisticsKobo;
}
