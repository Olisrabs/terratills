import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

// Service role client — server-side only. NEVER expose to client code.
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);
