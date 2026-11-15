import { z } from 'zod';

export const createBookingSchema = z.object({
  listing_id: z.string().uuid('Invalid listing ID'),
  notes: z.string().max(2000).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export const proposeTermsSchema = z.object({
  scope: z.string().min(1).max(1000),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  base_kobo: z.number().int().positive('Base amount must be positive'),
  logistics_kobo: z.number().int().min(0).default(0),
});

export const bookingActionSchema = z.object({
  action: z.enum([
    'accept_terms',
    'reject_terms',
    'cancel',
    'confirm_completion',
    'raise_dispute',
  ]),
  reason: z.string().max(1000).optional(),
  terms_id: z.string().uuid().optional(),
});
