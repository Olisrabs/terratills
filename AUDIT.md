# TerraTills Codebase & Architecture Audit (`AUDIT.md`)

*Audit Date: November 15, 2026*  
*Target Environment: Node.js (Active LTS), Express 5, React 19, Vite 8, Tailwind CSS v4*  
*Branch: `feat/backend-mvp`*  

---

## 1. Executive Summary

This document presents a comprehensive, line-by-line audit of the TerraTills repository prior to starting Phase 1 implementation. It catalogues the existing frontend views, client API invocations, response shape expectations, backend routes, in-memory data models, authentication mechanisms, and operational dependencies.

---

## 2. Frontend Routes & Page Catalog (31 Pages)

The frontend is structured as a client-side Single Page Application (SPA) driven by `src/App.jsx` and `src/context/AppContext.jsx`.

### 2.1 Public Showcase Pages (5 Pages - FROZEN)
| Route | Component Path | Access Level | Description & Key UI Elements |
| :--- | :--- | :--- | :--- |
| `/` | `src/pages/public/LandingPage.jsx` | Public | Hero with floating botanical SVGs, rolling hills banner, 4 category cards with sketch preview, ₦210B+ stats, operational framework. |
| `/about` | `src/pages/public/AboutPage.jsx` | Public | Mission statement, Nigerian agricultural mechanization deficit breakdown, 4 architecture pillars. |
| `/services` | `src/pages/public/ServicesPage.jsx` | Public | Directory breakdown of Farmland, Machinery, Labour, and Tutorials with benchmark rates and verification rules. |
| `/pricing` | `src/pages/public/PricingPage.jsx` | Public | 0% customer fee, 5% provider fee breakdown, Bach settlement explanation, FAQ accordion. |
| `/contact` | `src/pages/public/ContactPage.jsx` | Public | Inquiry form, Kaduna & Ibadan regional hubs, toll-free hotline, 2-hour SLA notice. |

### 2.2 Authentication Pages (3 Pages)
| Route | Component Path | Access Level | Description & Key UI Elements |
| :--- | :--- | :--- | :--- |
| `/login` | `src/pages/auth/LoginPage.jsx` | GuestOnly | Phone/email and password sign-in, quick demo login buttons for testing. |
| `/signup` | `src/pages/auth/RegisterPage.jsx` | GuestOnly | Registration form: legal name, email, Nigerian phone, state, town, password, terms agreement. |
| `/forgot-password` | `src/pages/auth/ForgotPasswordPage.jsx` | GuestOnly | 3-step recovery: Request code → Verify 6-digit code → Reset password. |

### 2.3 Authenticated Dashboard Views (23 Pages)
| Route | Component Path | Access Level | Description & Key UI Elements |
| :--- | :--- | :--- | :--- |
| `/dashboard` | `src/pages/DashboardOverview.jsx` | RequireAuth | Greeting with user first name, weather widget, 5-item horizontal services slider, active bookings, FAB for Agro AI. |
| `/dashboard/explore` | `src/pages/ExploreServices.jsx` | RequireAuth | Listings directory with category pills, state selector, price range filters, search input. |
| `/dashboard/explore/category/:slug` | `src/pages/ServiceCategory.jsx` | RequireAuth | Vertical-specific category listing (e.g. Farmland, Machinery, Labour, Training). |
| `/dashboard/explore/search` | `src/pages/SearchResults.jsx` | RequireAuth | Filterable query search results with filter state preservation. |
| `/dashboard/listing/:id` | `src/pages/ListingDetails.jsx` | RequireAuth | Deep listing view: gallery, provider card, verified badges, GPS soil specs, equipment HP, "Book Service" button. |
| `/dashboard/listing/:id/book` | `src/pages/BookingRequest.jsx` | RequireAuth | Scope negotiation form: dates, quantity, location, custom notes, price calculation. |
| `/dashboard/bookings` | `src/pages/MyBookings.jsx` | RequireAuth | Customer booking portal with status filter tabs (Active, Pending Terms, Completed, Cancelled). |
| `/dashboard/bookings/:id` | `src/pages/BookingDetails.jsx` | RequireAuth (Participant) | Lifecycle tracker, scope review, "Pay via Bach" action, dual-completion sign-off, chat shortcut. |
| `/dashboard/bookings/:id/confirmation` | `src/pages/BookingConfirmation.jsx` | RequireAuth (Participant) | Post-payment confirmation receipt with transaction reference and status check. |
| `/dashboard/services` | `src/pages/MyServices.jsx` | RequireAuth | Provider listing management console (active, paused, draft listings). |
| `/dashboard/services/new` | `src/pages/AddService.jsx` | RequireAuth | Multi-step listing creation wizard (category, details, pricing, photos). |
| `/dashboard/services/:id/edit` | `src/pages/EditService.jsx` | RequireAuth (Owner) | Edit existing service specs, pricing units, and operational location. |
| `/dashboard/services/:id` | `src/pages/ServiceDetailsManagement.jsx` | RequireAuth (Owner) | Listing performance metrics: inquiries, views, earnings, availability toggle. |
| `/dashboard/service-requests` | `src/pages/ServiceRequests.jsx` | RequireAuth (Provider) | Inbound customer inquiries queue: accept, decline, or counter scope. |
| `/dashboard/messages` | `src/pages/MessagesView.jsx` | RequireAuth | Direct conversational messaging threads between hirer and provider. |
| `/dashboard/notifications` | `src/pages/NotificationsView.jsx` | RequireAuth | Notification feed with mark-as-read and deep-linking to records. |
| `/dashboard/verification` | `src/pages/VerificationView.jsx` | RequireAuth | Trust center: identity (NIN/BVN), phone, email, machinery ownership, farmland title documents. |
| `/dashboard/assistant` | `src/pages/AIAssistantView.jsx` | Deferred | Chatbot advisor for agronomy inquiries, equipment horsepower calculations. |
| `/dashboard/profile` | `src/pages/ProfileView.jsx` | RequireAuth | Profile summary, clickable edit avatar badge (`✏️`), verification badges, Log Out button. |
| `/dashboard/settings` | `src/pages/SettingsView.jsx` | Deferred / Partial | Notification preferences, dispatch addresses, password update. |
| `/dashboard/reviews` | `src/pages/ReviewsView.jsx` | Deferred | History of reviews given and received. |
| `/dashboard/saved` | `src/pages/SavedItems.jsx` | Deferred | Bookmarked listings for quick access. |
| `/dashboard/support` | `src/pages/SupportView.jsx` | RequireAuth | Support tickets, dispute reporting, and regional hotline contact. |

---

## 3. Frontend API Calls & Expected Response Shapes

The frontend invokes the backend via `apiFetch(url, options)` in `src/context/AppContext.jsx`.

| Page / Component | Endpoint Called | Method | Payload / Query | Expected Response Shape |
| :--- | :--- | :--- | :--- | :--- |
| `AppContext.jsx` | `/api/auth/me` | `GET` | Headers: `x-user-id` | `{ user: User }` |
| `LoginPage.jsx` | `/api/auth/login` | `POST` | `{ emailOrPhone, password }` | `{ success: true, message: string, user: User }` |
| `RegisterPage.jsx` | `/api/auth/register` | `POST` | `{ name, email, phone, password, location }` | `{ success: true, message: string, user: User }` |
| `ForgotPasswordPage.jsx` | `/api/auth/forgot-password` | `POST` | `{ emailOrPhone }` | `{ success: true, message: string, verificationCode: string }` |
| `ForgotPasswordPage.jsx` | `/api/auth/reset-password` | `POST` | `{ emailOrPhone, code, newPassword }` | `{ success: true, message: string }` |
| `DashboardOverview.jsx` | `/api/dashboard/overview` | `GET` | None | `{ stats: { activeBookings, activeServices, pendingRequests, unreadMessages }, weather: { temp, condition, location, tip }, recentBookings: Booking[] }` |
| `DashboardOverview.jsx` | `/api/categories` | `GET` | None | `Category[]` |
| `DashboardOverview.jsx` | `/api/listings?limit=5` | `GET` | Query `limit=5` | `{ results: Listing[], pagination: { total, limit, page } }` |
| `ExploreServices.jsx` | `/api/categories` | `GET` | None | `Category[]` |
| `ExploreServices.jsx` | `/api/listings?limit=8` | `GET` | Query `limit=8` | `{ results: Listing[], pagination: { total, limit, page } }` |
| `ServiceCategory.jsx` | `/api/categories/:slug` | `GET` | Path `:slug` | `{ category: Category, listings: Listing[] }` |
| `SearchResults.jsx` | `/api/listings?q=...` | `GET` | Query: `q`, `category`, `state`, `minPrice`, `maxPrice` | `{ results: Listing[], pagination: { total, limit, page } }` |
| `ListingDetails.jsx` | `/api/listings/:id` | `GET` | Path `:id` | `{ listing: Listing, provider: User, reviews: Review[] }` |
| `ListingDetails.jsx` | `/api/saved/toggle` | `POST` | `{ listingId }` | `{ saved: boolean }` |
| `BookingRequest.jsx` | `/api/listings/:id` | `GET` | Path `:id` | `{ listing: Listing, provider: User }` |
| `BookingRequest.jsx` | `/api/bookings/new` | `POST` | `{ listingId, startDate, endDate, quantity, serviceLocation, notes, totalEstimatedPrice }` | `{ success: true, booking: Booking }` |
| `MyBookings.jsx` | `/api/bookings` | `GET` | Query `role`, `status` | `{ bookings: Booking[] }` |
| `BookingDetails.jsx` | `/api/bookings/:id` | `GET` | Path `:id` | `{ booking: Booking, terms: Object, conversationId: string }` |
| `BookingDetails.jsx` | `/api/messages/:convId` | `GET` | Path `:convId` | `{ messages: Message[] }` |
| `BookingDetails.jsx` | `/api/bookings/:id/pay` | `POST` | Path `:id` | `{ success: true, checkoutUrl: string, reference: string }` |
| `BookingDetails.jsx` | `/api/bookings/:id/verify-payment` | `POST` | `{ reference }` | `{ success: true, paymentStatus: string, booking: Booking }` |
| `BookingDetails.jsx` | `/api/bookings/:id/completion` | `POST` | `{ role: 'customer' \| 'provider', notes: string }` | `{ success: true, booking: Booking }` |
| `BookingConfirmation.jsx`| `/api/bookings/:id` | `GET` | Path `:id` | `{ booking: Booking }` |
| `MyServices.jsx` | `/api/services` | `GET` | Query `status` | `{ services: Listing[] }` |
| `MyServices.jsx` | `/api/services/:id/status` | `PATCH` | `{ status: 'active' \| 'paused' }` | `{ success: true, service: Listing }` |
| `AddService.jsx` | `/api/services/new` | `POST` | `{ title, categorySlug, pricing, location, attributes, images }` | `{ success: true, service: Listing }` |
| `EditService.jsx` | `/api/listings/:id` | `GET` | Path `:id` | `{ listing: Listing }` |
| `EditService.jsx` | `/api/services/:id` | `PUT` | Listing fields | `{ success: true, service: Listing }` |
| `ServiceDetailsManagement.jsx` | `/api/services/:id/performance` | `GET` | Path `:id` | `{ performance: { inquiriesCount, totalBookings, grossRevenue, conversionRate } }` |
| `ServiceDetailsManagement.jsx` | `/api/services/:id/availability` | `GET` | Path `:id` | `{ availability: { bookedDates: string[], availableDays: string[] } }` |
| `ServiceRequests.jsx` | `/api/service-requests` | `GET` | None | `{ requests: ServiceRequest[] }` |
| `ServiceRequests.jsx` | `/api/service-requests/:id/respond` | `POST` | `{ action: 'accept' \| 'decline' \| 'counter', counterDetails }` | `{ success: true, request: ServiceRequest }` |
| `MessagesView.jsx` | `/api/messages` | `GET` | None | `{ conversations: Conversation[] }` |
| `MessagesView.jsx` | `/api/messages/:id` | `GET` | Path `:id` | `{ messages: Message[], conversation: Conversation }` |
| `MessagesView.jsx` | `/api/messages/:id/send` | `POST` | `{ text }` | `{ success: true, message: Message }` |
| `NotificationsView.jsx` | `/api/notifications` | `GET` | None | `{ notifications: Notification[] }` |
| `NotificationsView.jsx` | `/api/notifications/:id/read` | `PATCH` | Path `:id` | `{ success: true }` |
| `NotificationsView.jsx` | `/api/notifications/mark-all-read` | `POST` | None | `{ success: true }` |
| `VerificationView.jsx` | `/api/verification` | `GET` | None | `{ verification: UserVerification, submissions: VerificationSubmission[] }` |
| `VerificationView.jsx` | `/api/verification/submit` | `POST` | `{ type, documents, declarationAccepted, notes }` | `{ success: true, submission: VerificationSubmission }` |
| `ProfileView.jsx` | `/api/profile` | `GET` | None | `{ user: User }` |
| `ProfileView.jsx` | `/api/profile/edit` | `PUT` | `{ name, phone, bio, location }` | `{ success: true, user: User }` |
| `SettingsView.jsx` | `/api/settings` | `GET` | None | `{ settings: UserSettings }` |
| `SettingsView.jsx` | `/api/settings` | `PUT` | `{ notifications, security }` | `{ success: true }` |
| `SettingsView.jsx` | `/api/settings/locations` | `POST` | Location object | `{ success: true, location: Object }` |
| `SettingsView.jsx` | `/api/settings/locations/:id` | `DELETE` | Path `:id` | `{ success: true }` |
| `SupportView.jsx` | `/api/support/faqs` | `GET` | None | `{ faqs: FAQ[] }` |
| `SupportView.jsx` | `/api/support/tickets` | `GET` | None | `{ tickets: SupportTicket[] }` |
| `SupportView.jsx` | `/api/support/tickets/new` | `POST` | `{ category, subject, description }` | `{ success: true, ticket: SupportTicket }` |
| `SupportView.jsx` | `/api/support/tickets/:id/reply`| `POST` | `{ message }` | `{ success: true, ticket: SupportTicket }` |
| `AIAssistantView.jsx` | `/api/assistant/query` | `POST` | `{ query }` | `{ answer: string, intent: string, extractedEntities: Object, recommendedListings: Listing[] }` |

---

## 4. Current State Management Approach

1. **Routing:** Handled manually inside `src/context/AppContext.jsx` using `window.history.pushState` and `popstate` listeners. No `react-router-dom` dependency exists.
2. **Session & Auth State:**
   - Active user ID stored in browser `localStorage.getItem('terratills_active_user')`.
   - Injected into every outbound HTTP call via header: `'x-user-id': userId`.
   - On initial mount, `AppContext` issues `fetch('/api/auth/me', { headers: { 'x-user-id': storedId } })`.
   - If missing, `currentUser` is `null` and user is directed to the public Landing Page.
3. **Global UI State:** Managed in `AppContext` via `useState`:
   - `currentUser`: active user object.
   - `currentRoute`: string path (e.g. `'/dashboard/bookings'`).
   - `routeParams`: object matching dynamic path slices (e.g. `{ id: 'book_101' }`).
   - `toasts`: array of toast notifications (`{ id, message, type }`).
   - `isOffline`: boolean tracker listening to `online`/`offline` window events.
   - `unreadNotifCount`: integer count.
4. **Local Page State:** Individual views manage their own data fetching and form state with React standard `useState` and `useEffect`.
5. **Target Architecture (per Section 6 & 21):**
   - TanStack Query (`@tanstack/react-query`) for server state caching and deduplication.
   - Zustand for client session snapshot and UI state.
   - React Hook Form + Zod for robust form validation.
   - Elimination of `x-user-id` and `localStorage` session tokens in favor of `httpOnly` `tt_sid` cookies.

---

## 5. In-Memory Entities & Schemas (`server/db.js`)

`server/db.js` defines an in-memory `Database` class initialized with mock collections stored in `this.data`.

| Entity Name | Collection Key | Records Count | Sample Primary Key | Key Attributes / Relationships |
| :--- | :--- | :--- | :--- | :--- |
| **Users** | `users` | 5 | `user_1` | `id`, `name`, `displayName`, `email`, `phone`, `role: 'user'`, `avatar`, `badge`, `bio`, `location` (state, lga, town), `verification` (identity, phone, email, machinery, farmland). |
| **Listings** | `listings` | 6 | `list_farmland_01` | `id`, `owner_id`, `provider_name`, `category` (`farmland`, `machinery`, `labour`, `training`), `title`, `description`, `price` (number NGN), `pricing_unit`, `status` (`active`, `paused`), `attributes` (size, machine_type, crew_size), `availability`. |
| **Bookings** | `bookings` | 4 | `book_101` | `id`, `reference`, `customer_id`, `provider_id`, `listing_id`, `category`, `scheduled_dates`, `amount_breakdown` (base, platform_fee 5%, logistics, total), `terms_agreed`, `status` (state machine), `payment_status`, `settlement_status`. |
| **Service Requests** | `service_requests` | 1 | `req_201` | `id`, `reference`, `listing_id`, `customer_id`, `provider_id`, `requested_dates`, `proposed_scope`, `proposed_amount`, `status` (`pending`, `accepted`, `countered`, `declined`). |
| **Transactions** | `transactions` | 4 | `txn_101` | `id`, `gateway_reference`, `booking_reference`, `type`, `direction`, `user_id`, `amount`, `currency`, `status`, `verification_state`, `provider: 'bach'`. |
| **Earnings** | `earnings` | 3 | `earn_101` | `id`, `provider_id`, `booking_id`, `gross_amount`, `commission` (5%), `net_earnings` (95%), `status`, `eligible_for_payout`. |
| **Payouts** | `payouts` | 2 | `payout_101` | `id`, `provider_id`, `reference`, `amount`, `destination_bank`, `destination_account`, `status` (`completed`, `pending`), `bach_transfer_reference`. |
| **Payment Methods** | `payment_methods` | 2 | `pm_1` | `id`, `user_id`, `type`, `brand`, `last4`, `bank_name`, `is_default`. |
| **Reviews** | `reviews` | 1 | `rev_101` | `id`, `booking_id`, `reviewer_id`, `reviewee_id`, `listing_id`, `rating` (5.0), `comment`, `category_ratings`. |
| **Saved Listings** | `saved_listings` | 2 | N/A (composite) | `user_id`, `listing_id`, `saved_at`. |
| **Conversations** | `conversations` | 2 | `conv_book_101` | `id`, `booking_id`, `participants` (`[customerId, providerId]`), `listing_id`, `last_message`, `unread_count`. |
| **Messages** | `messages` | 2 | `msg_1` | `id`, `conversation_id`, `sender_id`, `text`, `timestamp`, `read`. |
| **Notifications** | `notifications` | 5 | `notif_1` | `id`, `user_id`, `type`, `title`, `summary`, `related_record`, `destination`, `read`, `created_at`. |
| **Support Tickets** | `support_tickets` | 1 | `ticket_301` | `id`, `user_id`, `reference`, `category`, `subject`, `description`, `status`, `messages`. |
| **Verifications** | `verification_submissions` | 2 | `ver_101` | `id`, `user_id`, `type`, `status` (`approved`, `in_review`, `pending`), `documents`, `declaration_accepted`. |
| **User Locations** | `user_locations` | 2 | `loc_1` | `id`, `user_id`, `label`, `state`, `lga`, `town`, `is_default`. |
| **User Settings** | `user_settings` | 1 | Object map | Global & per-user toggles for notifications, SMS, 2FA, language. |
| **Audit Logs** | `audit_logs` | 9 | `audit_1` | `id`, `actor_id`, `action`, `target_type`, `target_id`, `timestamp`, `details`. |

---

## 6. Current Server Authentication Middleware

Found in `server/index.js` (lines 26–46):
```javascript
app.use((req, res, next) => {
  const isPublicAuth = 
    req.path.startsWith('/api/auth/login') ||
    req.path.startsWith('/api/auth/register') ||
    req.path.startsWith('/api/auth/forgot-password') ||
    req.path.startsWith('/api/auth/reset-password') ||
    req.path.startsWith('/api/public');

  if (isPublicAuth) return next();

  const activeUserId = req.headers['x-user-id'] || 'user_1';
  const user = db.getUser(activeUserId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated or user not found' });
  }
  req.user = user;
  next();
});
```

### Vulnerabilities & Inadequacies in Current Auth:
1. **Fallback Default User:** `req.headers['x-user-id'] || 'user_1'` automatically assumes `user_1` identity if no header is supplied.
2. **Client-Controlled Identity:** Any client can pass `x-user-id: user_2` and impersonate any user on the platform.
3. **No Session Tokens or Cookies:** No cryptographic session token exists; zero token revocation or session expiry handling.
4. **No Password Hashing:** Demo authentication performs plain equality checks (`user.password !== password`).
5. **No CSRF Protection:** No origin validation or CSRF header verification.
6. **No Rate Limiting:** Auth endpoints have zero rate limits against brute force attacks.

---

## 7. Package Versions & Dependencies

From `package.json`:

```json
{
  "dependencies": {
    "cors": "^2.8.6",
    "dotenv": "^18.0.9",
    "express": "^5.3.0",
    "lucide-react": "^1.70.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "uuid": "^14.0.3"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.5",
    "@vitejs/plugin-react": "^6.2.1",
    "autoprefixer": "^10.6.2",
    "concurrently": "^10.0.7",
    "postcss": "^8.5.32",
    "tailwindcss": "^4.3.5",
    "vite": "^8.3.6"
  }
}
```

### Required Dependencies to Add (Phase 1–6):
- **Language / Runtime:** `typescript`, `@types/node`, `@types/express`, `@types/cors`, `tsx`.
- **Database & ORM:** `pg`, `drizzle-orm`, `drizzle-kit`, `@types/pg`.
- **Validation & Serialization:** `zod`, `pino`, `pino-http`, `pino-pretty`, `helmet`.
- **Auth & Crypto:** `argon2`, `otplib`, `libphonenumber-js`, `cookie-parser`, `@types/cookie-parser`.
- **Queues & Storage:** `pg-boss`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `sharp`.
- **Email & Communications:** `nodemailer`, `@types/nodemailer`.
- **Frontend State:** `@tanstack/react-query`, `zustand`, `react-hook-form`, `@hookform/resolvers`.
- **Testing:** `vitest`, `supertest`, `@types/supertest`, `playwright`, `msw`, `fast-check`.

---

## 8. Existing Tests & Acceptance Test Suite

Located at `server/tests/backend.test.js`. Executed via `npm test`:
- **Test 1:** Unified Account Model (User acts as both Provider and Customer under one account ID).
- **Test 2:** Initial 4 Categories & Dynamic Attribute Verification (`farmland`, `machinery`, `labour`, `training`).
- **Test 3:** Independent State Transitions for Booking, Payment, and Settlement.
- **Test 4:** Bach Payment Adapter contract & server-side verification.
- **Test 5:** AI Assistant query grounding, entity extraction, and regulatory guardrails.

---

## 9. Build and Run Commands

- `npm run dev`: Executes `concurrently "node server/index.js" "vite"`.
- `npm run dev:server`: Starts Express server on port 5000.
- `npm run dev:client`: Starts Vite HMR dev server on port 5173.
- `npm run build`: Compiles production bundle with Vite into `dist/`.
- `npm start`: Serves production API and compiled static assets via Node.js.
- `npm test`: Executes `server/tests/backend.test.js`.

---

## 10. Real versus Mocked Capabilities Matrix

| Architectural Subsystem | Current Status | Real Implementation | Mocked / In-Memory Aspect | Target MVP State |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI (31 pages)** | **Real** | 100% interactive React 19 pages with complete state wiring. | Contact inquiry form uses `setTimeout`. | Preserved; wired to TanStack Query & real API. |
| **Database** | **Mocked** | Data structures mirror real relational models. | In-memory JavaScript arrays in `db.js`. Data lost on restart. | PostgreSQL + Drizzle ORM + raw SQL migrations. |
| **Authentication** | **Mocked** | Registration & Login endpoints exist. | Uses plain `x-user-id` header; no password hashing; no real OTP. | Phone OTP via SMS + Argon2id passwords + `tt_sid` cookie. |
| **State Machine** | **Partial** | Defined in `server/stateMachines.js`. | Memory-only state updates. | PostgreSQL row locks + `booking_status_history` + audit log. |
| **Payments** | **Mocked** | Defined in `server/adapters/bachPayment.js`. | Simulated token generation & fake verification endpoint. | Server-side Bach Adapter + raw body webhook HMAC. |
| **Ledger** | **Mocked** | Flat `transactions` & `earnings` arrays. | Floats in currency calculations; no double-entry balance check. | Integer kobo append-only ledger (`ledger_entries`) with zero-balance constraint. |
| **File Storage** | **Mocked** | Unsplash static URLs. | No signed URL generator; no metadata stripping or virus scan. | Private S3 bucket + Presigned URLs + Sharp + ClamAV. |
| **Notifications** | **Mocked** | Array stored in `db.data.notifications`. | No SMS or SMTP dispatch to real devices. | Worker queue (pg-boss) + Nodemailer + SMS Driver. |
| **Admin Console** | **Missing** | N/A | No staff admin console exists. | `/admin` lazy-loaded console with role-based MFA controls. |

---

*End of AUDIT.md. Prepared for Phase 0 sign-off.*
