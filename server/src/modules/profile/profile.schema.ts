import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  state: z.string().optional().nullable(),
  lga: z.string().optional().nullable(),
  town: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

export const completeOnboardingSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  state: z.string().min(1, 'State is required'),
  lga: z.string().min(1, 'LGA is required'),
  town: z.string().min(1, 'Town is required'),
  terms_accepted: z.literal(true, {
    message: 'You must accept the Terms & Conditions to continue.',
  }),
  email: z.string().email().optional().nullable(),
});
