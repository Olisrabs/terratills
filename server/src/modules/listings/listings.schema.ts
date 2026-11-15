import { z } from 'zod';

export const createListingSchema = z.object({
  category_slug: z.enum(['farmland', 'machinery', 'labour', 'training']),
  title: z.string().min(5).max(200),
  description: z.string().max(5000).optional(),
  pricing_model: z
    .enum(['fixed', 'per_day', 'per_hectare', 'per_hour', 'negotiable'])
    .default('fixed'),
  unit_price_kobo: z.number().int().nonnegative(),
  state: z.string().optional(),
  lga: z.string().optional(),
  town: z.string().optional(),
  attributes: z.record(z.string(), z.unknown()).default({}),
});

export const updateListingSchema = createListingSchema.partial();

export const listingsQuerySchema = z.object({
  category: z.string().optional(),
  state: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  status: z.string().default('active'),
});
