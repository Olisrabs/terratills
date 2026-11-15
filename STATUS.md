# Project Status Tracker (`STATUS.md`)

*Last Updated: November 15, 2026 (Phase 0 Audit & Planning)*  
*Current Phase: Phase 0 (Audit and Plan — Complete, Awaiting Sign-off)*  
*Working Branch: `feat/backend-mvp`*  

---

## 1. Unverified Statistics on Frozen Public Pages

*In compliance with Hard Rule 1, these statistics are identified from the frozen public site files and reported here for owner review. None of these frozen files have been altered.*

| File | Section | Displayed Value / Claim | Owner Action Needed |
| :--- | :--- | :--- | :--- |
| `src/pages/public/LandingPage.jsx` | Hero Micro-Pills | `🌱 100% Soil Profile Verified` | Confirm whether pilot acres have full lab soil profiling or preliminary surveyor check. |
| `src/pages/public/LandingPage.jsx` | Hero Micro-Pills | `🚜 4,800+ Tractors Active` | Confirm current active pilot tractor fleet count. |
| `src/pages/public/LandingPage.jsx` | Hero Banner Badge | `🌾 36 Nigerian States` | Confirm pilot rollout territory (recommended: focus on pilot states e.g. Kaduna, Oyo, Benue). |
| `src/pages/public/LandingPage.jsx` | Impact Metrics | `90% Organizations reduce delays` | Supply empirical baseline data citation or qualify as target benchmark. |
| `src/pages/public/LandingPage.jsx` | Impact Metrics | `75K Green initiatives supported` | Confirm platform launch contract milestone figures. |
| `src/pages/public/LandingPage.jsx` | Scale Display | `₦210B+ Investment in agricultural projects` | Confirm whether this reflects total market opportunity or platform target. |
| `src/pages/public/LandingPage.jsx` | Scale Display | `18k+ Sustainability Projects Deployed` | Confirm launch baseline project metric. |
| `src/pages/public/LandingPage.jsx` | Scale Display | `12k+ Organizations Adopting Green Tech` | Confirm launch pilot organization metric. |
| `src/pages/public/PricingPage.jsx` | Benchmark Rates | `₦12,000 – ₦45,000 / hectare / year` (Farmland) | Confirm regional benchmark rate accuracy for target pilot states. |
| `src/pages/public/PricingPage.jsx` | Benchmark Rates | `₦45,000 – ₦85,000 / day` (Machinery) | Confirm standard day rate benchmarks for 55HP–85HP tractors. |
| `src/pages/public/PricingPage.jsx` | Benchmark Rates | `₦35,000 – ₦65,000 / crew / day` (Labour) | Confirm standard daily crew rate for 10-person gangs. |
| `src/pages/public/PricingPage.jsx` | Benchmark Rates | `₦15,000 – ₦50,000 / masterclass` (Training) | Confirm training seat rate benchmarks. |
| `src/pages/public/ContactPage.jsx` | SLA Badge | `Standard 2-Hour SLA Response` | Confirm operational field desk coverage hours and staffing capacity. |

---

## 2. Phase 0 Status Breakdown

### Completed
- [x] Initialized Git repository and switched to branch `feat/backend-mvp`.
- [x] Comprehensive code audit of all 31 frontend pages and backend modules (`AUDIT.md`).
- [x] Formal isolation of public site files (`FROZEN.md`).
- [x] Generation of `frozen-files.sha256` checksum registry for 8 public site files.
- [x] Implementation and validation of `scripts/check-frozen.sh` verification script.
- [x] Complete mapping of Phases 1 through 7 with concrete files, tables, endpoints, and risks (`IMPLEMENTATION_PLAN.md`).
- [x] Cataloguing of unverified public statistics in `STATUS.md`.
- [x] Formal presentation of Phase 0 questions (Section 26).

### Partial
- None. (Phase 0 requires planning documents only; no partial code changes were introduced).

### Mocked (Existing in Repository)
- In-memory data store in `server/db.js` (to be replaced in Phases 1–5).
- Client-controlled header authentication via `x-user-id` (to be replaced in Phase 2).
- Simulated Bach payment adapter in `server/adapters/bachPayment.js` (to be replaced in Phase 5).
- Simulated AI responses in `server/aiEngine.js` (to be deferred behind feature flags).

### Outstanding (Scheduled for Phases 1–7)
- Phase 1: Foundations (PostgreSQL, Drizzle ORM, Zod env, Pino, Docker Compose, Vitest, CI).
- Phase 2: Auth, Phone OTP (E.164), `tt_sid` Sessions, Onboarding Wizard (`/onboarding`).
- Phase 3: Profile, Listings, S3/Presigned Media, Postgres Full-Text Search, Caching.
- Phase 4: Bookings, Terms Negotiation, State Machine (`lib/stateMachine.ts`), Contact Masking, Messaging.
- Phase 5: Bach Payments, HMAC Webhooks, Append-Only Double-Entry Ledger, Payouts, Refunds, Disputes.
- Phase 6: Offline Verifications, Field Inspections, Lazy-Loaded Admin Console (`/admin`), Assisted Creation.
- Phase 7: Hardening, Rate Limiting, Backup/Restore Verification, Runbook (`docs/RUNBOOK.md`).

---

## 3. Phase 0 Sign-Off Questions

See Section 8 of `IMPLEMENTATION_PLAN.md` and the final prompt response for the complete questions for the owner.
