# TerraTills Backend & Integration Implementation Plan (`IMPLEMENTATION_PLAN.md`)

*Version: 1.0.0 — Phase 0 Planning Baseline*  
*Target Architecture: Express 5 + TypeScript + PostgreSQL (Drizzle ORM) + React 19 / Vite*  
*Branch: `feat/backend-mvp`*  

---

## 1. Phase Mapping & Execution Overview

This implementation plan details the architectural roadmap to build the authoritative backend for TerraTills, implement the staff admin console, wire the existing 31-page React frontend, and establish the double-entry financial ledger and Bach payment integration.

```
┌────────────────────────────────────────────────────────────────────────┐
│  PHASE ROADMAP & MILESTONES                                            │
│                                                                        │
│  [X] Phase 0: Audit, Frozen Public Registry & Implementation Plan      │
│  [ ] Phase 1: Core Foundations, Tooling, Database Schema & Docker      │
│  [ ] Phase 2: Auth, E.164 Phone OTP, Sessions & Onboarding Wizard      │
│  [ ] Phase 3: Profile, Listings, S3 Presigned Media, Search & Cache   │
│  [ ] Phase 4: Bookings, Terms State Machine, Contact Masking & Comm   │
│  [ ] Phase 5: Bach Payments, Raw Webhooks, Double-Entry Ledger, Payouts│
│  [ ] Phase 6: Offline Inspections, Lazy-Loaded Admin Console & Assisted│
│  [ ] Phase 7: Security Hardening, Backup Restore Testing & Runbook     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Core Foundations & Infrastructure

### 2.1 Concrete Files to Add/Update
- `package.json`: Add dependencies (`typescript`, `pg`, `drizzle-orm`, `drizzle-kit`, `pino`, `pino-http`, `helmet`, `zod`, `vitest`, `supertest`, `dotenv`, `testcontainers`). Add npm scripts: `typecheck`, `lint`, `db:up`, `db:migrate`, `db:seed`, `check:frozen`.
- `tsconfig.json`: Strict TypeScript configuration targeting Node 20 / ES2022.
- `docker-compose.yml`: Local services: PostgreSQL (with `btree_gist`, `pg_trgm`, `citext`, `pgcrypto`), Valkey (Redis alternative), Mailpit (local SMTP UI), MinIO (S3-compatible local bucket).
- `server/src/config/env.ts`: Zod-validated environment schema (`DATABASE_URL`, `VALKEY_URL`, `SESSION_SECRET`, `OTP_HMAC_SECRET`, `DATA_ENCRYPTION_KEY`, `APP_ORIGIN`, `NODE_ENV`). Fails fast on startup if missing.
- `server/src/lib/logger.ts`: Structured JSON logging via Pino with sensitive data redaction.
- `server/src/lib/errors.ts`: Standard error envelope `{ error: { code, message, details }, requestId }`.
- `server/src/db/schema/`: Drizzle ORM schema definitions for all 24 database tables.
- `server/src/db/migrations/`: Raw SQL migrations including triggers, constraints, and index definitions.
- `server/src/db/seed/devSeed.ts`: Development seed script recreating existing mock data shapes. Fails if `NODE_ENV=production`.
- `server/src/app.ts` & `server/src/server.ts`: Modular Express 5 initialization.
- `.github/workflows/ci.yml`: GitHub Actions pipeline running `check-frozen.sh`, linting, typechecking, migration verification, and tests.

### 2.2 Database Tables Created
`users`, `user_roles`, `staff_mfa`, `sessions`, `otp_codes`, `categories`, `listings`, `listing_media`, `bookings`, `booking_terms`, `booking_status_history`, `booking_completion`, `payment_intents`, `webhook_events`, `ledger_accounts`, `ledger_entries`, `bank_accounts`, `payouts`, `refunds`, `verifications`, `verification_documents`, `inspections`, `inspection_media`, `disputes`, `support_tickets`, `ticket_messages`, `conversations`, `conversation_members`, `messages`, `notifications`, `settings`, `audit_log`, `reconciliation_runs`.

### 2.3 Key Risks & Mitigations
- **Postgres Exclusion Constraints:** `ALTER TABLE bookings ADD CONSTRAINT no_overlap EXCLUDE USING gist (listing_id WITH =, daterange(start_date, end_date, '[]') WITH &&)` requires `btree_gist` extension. Mitigation: Initialize extension in migration `0001_init.sql` before table creation.
- **Ledger Immutability:** Revoking `UPDATE` and `DELETE` on `ledger_entries` requires a dedicated non-superuser application database role. Mitigation: Create separate `terratills_app` role in Docker initialization script.

---

## 3. Phase 2: Authentication, Phone OTP, Sessions & Onboarding

### 3.1 Concrete Files to Add/Update
- `server/src/lib/phone.ts`: Nigerian phone number parsing and E.164 normalization via `libphonenumber-js` (default `NG`). Rejects non-Nigerian numbers unless `ALLOW_INTERNATIONAL_PHONE=true`.
- `server/src/lib/crypto.ts`: Constant-time HMAC comparison, AES-256-GCM field encryption/decryption, CSPRNG OTP generation.
- `server/src/modules/auth/`:
  - `auth.routes.ts`: Routes for register, verify-otp, login, login/password, resend-otp, logout, password change, email update, me.
  - `auth.service.ts`: OTP rate limiting (5 attempts, 10-min validity, 60s cooldown, max 5 sends/phone/hr), session token creation (32-byte CSPRNG hash), session rotation.
  - `auth.schema.ts`: Zod schemas for all auth payloads.
- `server/src/middleware/session.ts`: `httpOnly`, `SameSite=Lax`, `Secure` cookie parser reading `tt_sid`. Validates hash against `sessions` table. Replaces and eliminates `x-user-id`.
- `server/src/middleware/csrf.ts`: Validates `X-Requested-With: terratills` header and `Origin` against `APP_ORIGIN`.
- `src/lib/api.ts`: Centralized frontend API client (JSON envelope parsing, credentials included, 401 redirect to `/login`).
- `src/pages/auth/VerifyPhonePage.jsx`: Phone OTP verification page with 6-digit input and resend countdown.
- `src/pages/onboarding/OnboardingPage.jsx`: New 5-step mobile-first wizard (`Confirm Profile` → `Interests` → `Optional Email & Password` → `Verification Brief` → `Dashboard`).
- `src/pages/auth/LoginPage.jsx` & `RegisterPage.jsx`: Updated to talk to real session endpoints.

### 3.2 Endpoints Implemented
- `POST /api/auth/register` (Generic response to prevent user enumeration)
- `POST /api/auth/verify-otp` (Validates HMAC, marks phone verified, sets `tt_sid` cookie, returns `needsOnboarding`)
- `POST /api/auth/login` (Sends OTP if phone exists; generic 200 response)
- `POST /api/auth/login/password` (Password fallback if set)
- `POST /api/auth/resend-otp` (Enforces 60-second cooldown)
- `POST /api/auth/logout` (Revokes session in database, clears cookie)
- `GET /api/auth/me` (Authoritative active session snapshot)
- `POST /api/auth/password` (Set/change password; requires recent OTP verification)
- `PATCH /api/auth/email` (Add email and trigger verification job)
- `GET /api/onboarding` & `PATCH /api/onboarding` & `POST /api/onboarding/complete`

### 3.3 Key Risks & Mitigations
- **SMS Delivery Latency in Nigeria:** OTP delivery via telecom gateways may experience network delay. Mitigation: Implement Console Driver for development; support WhatsApp fallback adapter; allow resend with cooldown.

---

## 4. Phase 3: Profile, Listings, Search, Media & Caching

### 4.1 Concrete Files to Add/Update
- `server/src/lib/cache.ts`: Cache abstraction (`get`, `set`, `del`, `delByPrefix`, `wrap`) with single-flight protection. Connects to Valkey with in-memory LRU fallback.
- `server/src/providers/storage/s3Provider.ts`: S3 client generating presigned upload URLs with MIME, extension, and file size constraints.
- `server/src/jobs/scanUploadJob.ts`: Sharp metadata stripping, resizing, and ClamAV virus scanning job.
- `server/src/modules/listings/`:
  - `listings.routes.ts`: Search, category, single listing, availability calendar.
  - `listings.service.ts`: Attribute validation via `category.attribute_schema`, `search_tsv` tsvector indexing.
- `server/src/modules/profile/`: User profile updates, bank account registration (encrypted with AES-256-GCM).
- `src/features/listings/api.ts` & `src/features/profile/api.ts`: TanStack Query hooks.
- Wired Pages: `ExploreServices.jsx`, `ServiceCategory.jsx`, `SearchResults.jsx`, `ListingDetails.jsx`, `ProfileView.jsx`, `MyServices.jsx`, `AddService.jsx`, `EditService.jsx`.

### 4.2 Endpoints Implemented
- `GET /api/categories` & `GET /api/categories/:slug` (Cached 1 hr)
- `GET /api/listings` (Postgres FTS + `pg_trgm` fuzzy matching, cursor pagination; cached 45s)
- `GET /api/listings/:id` (Cached 60s)
- `GET /api/listings/:id/availability` (Booked date ranges only)
- `GET /api/services` & `POST /api/services/new` (Owner listing management)
- `PUT /api/services/:id` & `PATCH /api/services/:id/status`
- `POST /api/uploads/sign` & `POST /api/uploads/complete`
- `GET /api/profile` & `PUT /api/profile/edit`
- `GET /api/bank-accounts` & `POST /api/bank-accounts`

---

## 5. Phase 4: Bookings, Terms Negotiation, State Machine & Messaging

### 5.1 Concrete Files to Add/Update
- `server/src/lib/stateMachine.ts`: Central booking transition engine. Validates actor role, checks current status, writes `booking_status_history`, enforces transition legality, and emits queue jobs in the same transaction.
- `server/src/modules/bookings/`:
  - `bookings.routes.ts`: Booking inquiry, counter-proposal review, cancel, completion.
  - `bookings.service.ts`: Price calculation, commission snapshot (5%), terms versioning.
- `server/src/modules/messaging/`:
  - `messages.routes.ts`: Conversation and message handling.
  - `messages.service.ts`: Contact detail masking regex (hides phone numbers, emails, and external links before `paid_confirmed` status).
- `server/src/modules/notifications/`: Notification dispatch via database and SMS/email jobs.
- `src/features/bookings/api.ts` & `src/features/messages/api.ts`: TanStack Query hooks.
- Wired Pages: `BookingRequest.jsx`, `MyBookings.jsx`, `BookingDetails.jsx`, `ServiceRequests.jsx`, `MessagesView.jsx`, `NotificationsView.jsx`.

### 5.2 Endpoints Implemented
- `POST /api/bookings/new` (Creates inquiry, terms version 1, conversation; notifies provider)
- `GET /api/bookings` & `GET /api/bookings/:id` (Returns `myRole` and computed `allowedActions`)
- `POST /api/service-requests/:id/respond` (`accept`, `decline`, or `counter` creating version 2)
- `POST /api/bookings/:id/terms-review` (`accept` or `decline` current terms version)
- `POST /api/bookings/:id/start` (Provider marks work mobilization started)
- `POST /api/bookings/:id/completion` (Customer/Provider completion sign-off)
- `POST /api/bookings/:id/cancel` (Cancellation with policy enforcement)
- `GET /api/messages` & `GET /api/messages/:id` & `POST /api/messages/:id/send`
- `GET /api/notifications` & `PATCH /api/notifications/:id/read` & `POST /api/notifications/mark-all-read`

---

## 6. Phase 5: Bach Payments, Raw Webhooks, Ledger, Payouts & Disputes

### 6.1 Concrete Files to Add/Update
- `server/src/lib/money.ts`: Integer kobo calculations, commission snapshot (`commission_kobo = round_half_up(base_kobo * commission_bps / 10000)`), property-based tests via `fast-check`.
- `server/src/lib/ledger.ts`: Append-only double-entry posting (`postTransaction`). Rejects unbalanced postings or non-positive amounts. Accounts: `cash_gateway`, `provider_payable`, `platform_revenue`.
- `server/src/providers/payment/paymentProvider.interface.ts`: Standard interface.
- `server/src/providers/payment/fakePaymentProvider.ts`: Development & test payment provider. Throws if `NODE_ENV=production`.
- `server/src/providers/payment/bachPaymentProvider.ts`: Production Bach adapter with webhook HMAC verification and status polling.
- `server/src/jobs/processWebhookJob.ts`: Webhook processor locking payment intent `FOR UPDATE`, verifying transaction with Bach server-side, posting ledger entries, and advancing booking to `paid_confirmed`.
- `server/src/jobs/reconcileJob.ts`: Nightly reconciliation comparing database bookings, ledger balances, and payment intent states.
- Wired Pages: `BookingDetails.jsx` (Pay action), `BookingConfirmation.jsx` (Status polling).

### 6.2 Endpoints Implemented
- `POST /api/bookings/:id/pay` (Requires `Idempotency-Key` header; locks dates; creates payment intent)
- `POST /api/bookings/:id/verify-payment` (UI refresh endpoint triggering server check)
- `POST /api/payments/bach/webhook` (Mounted with `express.raw({ type: '*/*' })`; verifies signature; idempotently enqueues processing)
- `POST /api/bookings/:id/disputes` (Opens dispute, holds payout)

---

## 7. Phase 6: Inspections, Lazy-Loaded Admin Console & Assisted Creation

### 7.1 Concrete Files to Add/Update
- `server/src/middleware/requireRole.ts`: Staff role authorization (`support`, `verifier`, `finance`, `admin`) requiring session with `mfa_verified_at`.
- `server/src/modules/admin/`:
  - `admin.overview.routes.ts`: Real-time dashboard KPI counts (pending verifications, payouts due, open disputes).
  - `admin.verifications.routes.ts`: Field inspection checklist recording, GPS tracking, decision approval/rejection with expiry.
  - `admin.listings.routes.ts`: Listing approval, suspension, prerequisite verification checks.
  - `admin.payouts.routes.ts`: Payout processing, bank reference recording, CSV export.
  - `admin.assisted.routes.ts`: Assisted listing and booking creation on behalf of offline farmers with audit logging.
- `src/admin/`: Lazy-loaded desktop-first admin portal built with existing design tokens.
  - `AdminLayout.jsx`, `AdminOverview.jsx`, `AdminVerifications.jsx`, `AdminListings.jsx`, `AdminBookings.jsx`, `AdminPayments.jsx`, `AdminPayouts.jsx`, `AdminDisputes.jsx`, `AdminAssisted.jsx`, `AdminAuditLog.jsx`, `AdminSettings.jsx`.
- CLI Tool: `scripts/create-admin.ts` (`npm run admin:create -- --phone +234...`) for bootstrapping first administrator.

---

## 8. Phase 7: Hardening, Deployment, Runbook & Verification

### 8.1 Concrete Files to Add/Update
- `scripts/backup.sh`: Encrypted `pg_dump` backup script with automated retention pruning.
- `scripts/restore-test.sh`: Automated backup restoration verification test in an ephemeral container.
- `Dockerfile`: Multi-stage, non-root production container.
- `docker-compose.prod.yml`: Production orchestration (App, Worker, Valkey, Caddy with automatic Let's Encrypt HTTPS).
- `docs/ARCHITECTURE.md`, `docs/API.md` (OpenAPI generated from Zod schemas), `docs/RUNBOOK.md` (webhook replay, stuck payment resolution, manual payout execution, dispute escalation, secret rotation), `docs/DATA_PROTECTION.md`.

---

## 9. Key Questions for Owner Sign-Off (Section 26)

Before proceeding with Phase 1 execution, the following 8 questions must be confirmed:

1. **Bach API Documentation & Credentials:**
   - What are the sandbox API base URL, public key, secret key, and webhook secret for Bach?
   - What signature scheme does Bach use (e.g. HMAC-SHA256, HMAC-SHA512) and in which header is it delivered?
   - Does Bach support outbound transfers/payouts to Nigerian NIP accounts, or will all MVP payouts be processed manually by staff via commercial online banking with a recorded bank reference?
   - Does Bach support direct API refunds, or are refunds handled via manual reversal?

2. **SMS / WhatsApp OTP Delivery Vendor:**
   - Which SMS gateway vendor should be used for Nigerian phone OTP delivery (e.g. Termii, Twilio, Africa's Talking)?
   - Should WhatsApp OTP delivery be configured alongside SMS?

3. **Deployment Target & Infrastructure:**
   - Where will the staging and production environments be hosted (e.g. VPS, DigitalOcean, AWS Africa / Europe, Railway)?
   - Will PostgreSQL be a managed instance or self-hosted in Docker?
   - What domain name will be assigned, and where will the Postal SMTP server run?

4. **Commission Base & Gateway Fee Absorption:**
   - Is it confirmed that the 5% platform commission applies strictly to the base service price, with logistics surcharges passing through 100% to the provider?
   - Who bears the Bach payment gateway processing fee (the hirer, the provider, or absorbed by TerraTills within the 5%)?

5. **Cancellation & Refund Policy Defaults:**
   - What are the default cancellation windows (e.g. full refund if cancelled > 48 hours before start date; 50% refund if cancelled 24–48 hours; zero refund if machinery has mobilized)?

6. **Frozen Files Registry Confirmation:**
   - Confirm that the 8 files listed in `FROZEN.md` and `frozen-files.sha256` accurately and completely cover all public pages, public components, and their presentation CSS.

7. **Branching Strategy & Test Credentials:**
   - Confirm that `feat/backend-mvp` is the approved feature branch, with small commits and GitHub pull requests back to `main`.
   - Confirm that the existing acceptance tests (`server/tests/backend.test.js`) will continue to pass alongside the new Vitest suite.

8. **Pilot Verticals & Launch States:**
   - Which categories (`farmland`, `machinery`, `labour`, `training`) and Nigerian states (e.g. Kaduna, Oyo, Benue, Niger) are prioritized for the live field pilot?
