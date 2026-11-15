import { z } from 'zod';

export const sendOtpSchema = z.object({
  phone: z.string().min(7).max(20),
  purpose: z.enum(['register', 'login', 'recovery']).default('login'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(7).max(20),
  code: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
  purpose: z.enum(['register', 'login', 'recovery']).default('login'),
});
