import { z } from 'zod';
import { config } from 'dotenv';
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  OTP_HMAC_SECRET: z.string().min(32),
  APP_ORIGIN: z.string().url().default('http://localhost:5173'),
  SMS_DRIVER: z.enum(['console', 'twilio']).default('console'),
  BACH_API_BASE: z.string().default('https://api.bach.ng'),
  BACH_SECRET_KEY: z.string().default('TODO'),
  BACH_WEBHOOK_SECRET: z.string().default('TODO'),
  PAYOUT_AUTOMATION: z.coerce.boolean().default(false),
  ENABLE_DEV_SWITCH_USER: z.coerce.boolean().default(false),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid or missing environment variables:');
  console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  console.error('\nCopy .env.example to .env and fill in the values.');
  process.exit(1);
}

export const env = result.data;
