-- ============================================================
-- TerraTills Database Schema
-- Run this in your Supabase SQL Editor (once)
-- ============================================================

-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";

-- ============================================================
-- USERS
-- ============================================================
create table if not exists users (
  id                      uuid primary key default gen_random_uuid(),
  phone                   text unique not null,
  phone_verified_at       timestamptz,
  email                   citext unique,
  legal_name              text,
  display_name            text,
  password_hash           text,
  state                   text,
  lga                     text,
  town                    text,
  country                 text not null default 'NG',
  avatar_url              text,
  bio                     text,
  status                  text not null default 'active'
                            check (status in ('active','suspended','banned')),
  onboarding_completed_at timestamptz,
  terms_accepted_at       timestamptz,
  rating_avg              numeric(3,2) default 0,
  rating_count            int default 0,
  completed_bookings      int default 0,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ============================================================
-- SESSIONS
-- ============================================================
create table if not exists sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  token_hash   text unique not null,
  ip           text,
  user_agent   text,
  expires_at   timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists sessions_token_hash_idx on sessions(token_hash);
create index if not exists sessions_user_id_idx    on sessions(user_id);

-- ============================================================
-- OTP CODES
-- ============================================================
create table if not exists otp_codes (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null,
  purpose     text not null check (purpose in ('register','login','recovery')),
  code_hash   text not null,
  expires_at  timestamptz not null,
  attempts    int not null default 0,
  consumed_at timestamptz,
  ip          text,
  created_at  timestamptz not null default now()
);

create index if not exists otp_codes_phone_purpose_idx on otp_codes(phone, purpose);

-- ============================================================
-- CATEGORIES (seeded below)
-- ============================================================
create table if not exists categories (
  slug             text primary key,
  name             text not null,
  short_name       text,
  description      text,
  icon             text,
  attribute_schema jsonb not null default '[]',
  created_at       timestamptz not null default now()
);

insert into categories (slug, name, short_name, description, icon, attribute_schema) values
  ('farmland',
   'Farmland Leasing',
   'Farmland',
   'Lease fertile agricultural land across Nigerian states with verified land title & soil profiles.',
   'Tractor',
   '["size","unit","soil_type","water_source","topography","lease_term","title_type"]'),
  ('machinery',
   'Machinery Rental',
   'Machinery',
   'Rent commercial tractors, harvesters, disc harrows and sprayers with verified certified operators.',
   'Truck',
   '["machine_type","make_model","horsepower","condition","operator_included","fuel_terms","delivery_available"]'),
  ('labour',
   'Farm Labour',
   'Labour',
   'Hire vetted, experienced agricultural teams for planting, precision spraying, weeding and harvesting.',
   'Users',
   '["crew_size","work_type","experience_years","daily_hours","tools_provided","accommodation_required"]'),
  ('training',
   'Agricultural Training & Tutorials',
   'Training',
   'Practical agronomy masterclasses, livestock management, and export crop processing certificates.',
   'GraduationCap',
   '["course_level","delivery_mode","duration_days","certification","materials_included","instructor_credentials"]')
on conflict (slug) do nothing;

-- ============================================================
-- LISTINGS
-- ============================================================
create table if not exists listings (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  category_slug  text not null references categories(slug),
  title          text not null,
  description    text,
  pricing_model  text not null default 'fixed'
                   check (pricing_model in ('fixed','per_day','per_hectare','per_hour','negotiable')),
  unit_price_kobo bigint not null check (unit_price_kobo >= 0),
  state          text,
  lga            text,
  town           text,
  lat            numeric(9,6),
  lng            numeric(9,6),
  attributes     jsonb not null default '{}',
  status         text not null default 'pending_review'
                   check (status in ('draft','pending_review','active','paused','suspended')),
  images         text[] not null default '{}',
  view_count     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists listings_category_idx on listings(category_slug);
create index if not exists listings_user_idx     on listings(user_id);
create index if not exists listings_status_idx   on listings(status);
create index if not exists listings_state_idx    on listings(state);

-- ============================================================
-- BOOKINGS
-- ============================================================
create table if not exists bookings (
  id             uuid primary key default gen_random_uuid(),
  listing_id     uuid not null references listings(id),
  customer_id    uuid not null references users(id),
  provider_id    uuid not null references users(id),
  status         text not null default 'inquiry'
                   check (status in (
                     'inquiry','negotiating','terms_agreed','payment_pending',
                     'payment_held','active','customer_confirmed','provider_confirmed',
                     'completed','disputed','cancelled','refunded'
                   )),
  payment_status text not null default 'unpaid'
                   check (payment_status in ('unpaid','pending','held','released','refunded')),
  start_date     date,
  end_date       date,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists bookings_customer_idx on bookings(customer_id);
create index if not exists bookings_provider_idx on bookings(provider_id);
create index if not exists bookings_listing_idx  on bookings(listing_id);
create index if not exists bookings_status_idx   on bookings(status);

-- ============================================================
-- BOOKING TERMS
-- ============================================================
create table if not exists booking_terms (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null references bookings(id) on delete cascade,
  version             int not null default 1,
  proposed_by         uuid not null references users(id),
  scope               text,
  quantity            numeric(10,2),
  unit                text,
  base_kobo           bigint not null check (base_kobo >= 0),
  logistics_kobo      bigint not null default 0 check (logistics_kobo >= 0),
  commission_kobo     bigint not null default 0 check (commission_kobo >= 0),
  customer_total_kobo bigint not null check (customer_total_kobo >= 0),
  provider_net_kobo   bigint not null check (provider_net_kobo >= 0),
  status              text not null default 'proposed'
                        check (status in ('proposed','accepted','rejected','superseded')),
  created_at          timestamptz not null default now()
);

-- ============================================================
-- BOOKING STATUS HISTORY
-- ============================================================
create table if not exists booking_status_history (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  from_status text,
  to_status   text not null,
  actor_id    uuid references users(id),
  reason      text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- PAYMENT INTENTS
-- ============================================================
create table if not exists payment_intents (
  id               uuid primary key default gen_random_uuid(),
  booking_id       uuid not null references bookings(id),
  terms_id         uuid references booking_terms(id),
  provider         text not null default 'bach',
  provider_ref     text,
  idempotency_key  text unique not null,
  amount_kobo      bigint not null check (amount_kobo > 0),
  status           text not null default 'pending'
                     check (status in ('pending','processing','held','failed','refunded')),
  checkout_url     text,
  verified_at      timestamptz,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- LEDGER ACCOUNTS
-- ============================================================
create table if not exists ledger_accounts (
  id         uuid primary key default gen_random_uuid(),
  code       text not null
               check (code in ('cash_gateway','provider_payable','platform_revenue')),
  user_id    uuid references users(id),
  created_at timestamptz not null default now(),
  unique(code, user_id)
);

-- ============================================================
-- LEDGER ENTRIES (append-only)
-- ============================================================
create table if not exists ledger_entries (
  id          uuid primary key default gen_random_uuid(),
  txn_id      uuid not null,
  account_id  uuid not null references ledger_accounts(id),
  direction   text not null check (direction in ('debit','credit')),
  amount_kobo bigint not null check (amount_kobo > 0),
  booking_id  uuid references bookings(id),
  memo        text,
  created_at  timestamptz not null default now()
);

-- Prevent mutation of ledger entries
create or replace rule ledger_no_update
  as on update to ledger_entries do instead nothing;
create or replace rule ledger_no_delete
  as on delete to ledger_entries do instead nothing;

-- ============================================================
-- PAYOUTS
-- ============================================================
create table if not exists payouts (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid unique references bookings(id),
  provider_id    uuid not null references users(id),
  amount_kobo    bigint not null check (amount_kobo > 0),
  status         text not null default 'due'
                   check (status in ('due','held','processing','paid','failed')),
  bank_reference text,
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- VERIFICATIONS
-- ============================================================
create table if not exists verifications (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references users(id),
  type                 text not null
                         check (type in ('identity','farmland','machinery','labour','training')),
  status               text not null default 'pending'
                         check (status in ('pending','under_review','approved','rejected','expired')),
  reviewer_id          uuid references users(id),
  decision_note        text,
  submitted_documents  text[],
  approved_at          timestamptz,
  expires_at           timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
create table if not exists conversations (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid unique references bookings(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references users(id),
  body            text not null,
  was_masked      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx on messages(conversation_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  type       text not null,
  payload    jsonb not null default '{}',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications(user_id);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
create table if not exists support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id),
  subject    text not null,
  body       text not null,
  status     text not null default 'open'
               check (status in ('open','in_progress','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- AUDIT LOG (append-only)
-- ============================================================
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references users(id),
  action      text not null,
  entity      text not null,
  entity_id   text,
  before_json jsonb,
  after_json  jsonb,
  ip          text,
  created_at  timestamptz not null default now()
);

create or replace rule audit_no_update
  as on update to audit_log do instead nothing;
create or replace rule audit_no_delete
  as on delete to audit_log do instead nothing;

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger users_updated_at
  before update on users for each row execute function set_updated_at();
create or replace trigger listings_updated_at
  before update on listings for each row execute function set_updated_at();
create or replace trigger bookings_updated_at
  before update on bookings for each row execute function set_updated_at();
create or replace trigger verifications_updated_at
  before update on verifications for each row execute function set_updated_at();
create or replace trigger support_tickets_updated_at
  before update on support_tickets for each row execute function set_updated_at();
