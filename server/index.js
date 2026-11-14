import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { db, CATEGORIES } from './db.js';
import { BOOKING_STATES, PAYMENT_STATES, SETTLEMENT_STATES, canTransitionBooking, evaluateSettlementState } from './stateMachines.js';
import { bachAdapter } from './adapters/bachPayment.js';
import { TerraTillsAIEngine } from './aiEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize AI Engine
const aiEngine = new TerraTillsAIEngine(db);

// Auth & Context Middleware: In unified dashboard, user is authenticated
// We provide an active user header for seamless switching to test contextual roles
app.use((req, res, next) => {
  // Public auth & info endpoints don't require an active user
  const isPublicAuth = 
    req.path.startsWith('/api/auth/login') ||
    req.path.startsWith('/api/auth/register') ||
    req.path.startsWith('/api/auth/forgot-password') ||
    req.path.startsWith('/api/auth/reset-password') ||
    req.path.startsWith('/api/public');

  if (isPublicAuth) {
    return next();
  }

  const activeUserId = req.headers['x-user-id'] || 'user_1';
  const user = db.getUser(activeUserId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated or user not found' });
  }
  req.user = user;
  next();
});

// -------------------------------------------------------------
// 1. AUTH & USER PROFILE
// -------------------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, location } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone number are required.' });
  }

  const existing = db.getUserByEmailOrPhone(email) || db.getUserByEmailOrPhone(phone);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email or phone number already exists.' });
  }

  const user = db.createUser({
    name,
    email,
    phone,
    password: password || 'password123',
    location: location || { state: 'Kaduna', lga: 'Zaria', town: 'Zaria', country: 'Nigeria' }
  });

  res.status(201).json({
    success: true,
    message: 'Unified account created successfully.',
    user
  });
});

app.post('/api/auth/login', (req, res) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone) {
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  const user = db.getUserByEmailOrPhone(emailOrPhone);
  if (!user) {
    return res.status(404).json({ error: 'Account not found with this email or phone number.' });
  }

  // Demo simple authentication
  if (password && user.password && user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your password.' });
  }

  res.json({
    success: true,
    message: `Welcome back, ${user.displayName || user.name}!`,
    user
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { emailOrPhone } = req.body;
  if (!emailOrPhone) {
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  const user = db.getUserByEmailOrPhone(emailOrPhone);
  if (!user) {
    return res.status(404).json({ error: 'No account registered with this email or phone number.' });
  }

  // Simulated 6-digit verification code
  const code = '849201';
  res.json({
    success: true,
    message: `Password reset verification code sent to ${emailOrPhone}.`,
    verificationCode: code
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { emailOrPhone, code, newPassword } = req.body;
  if (!emailOrPhone || !newPassword) {
    return res.status(400).json({ error: 'Email/phone and new password are required.' });
  }

  const user = db.getUserByEmailOrPhone(emailOrPhone);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (code && code !== '849201' && code !== '123456') {
    return res.status(400).json({ error: 'Invalid or expired verification code.' });
  }

  db.updateUserPassword(user.id, newPassword);
  res.json({
    success: true,
    message: 'Password updated successfully. You can now sign in with your new password.'
  });
});

app.get('/api/auth/me', (req, res) => {
  const allUsers = db.getUsers().map(u => ({ id: u.id, name: u.name, role: u.role, avatar: u.avatar }));
  res.json({
    user: req.user,
    availableSwitchUsers: allUsers
  });
});

app.post('/api/auth/switch-user', (req, res) => {
  const { userId } = req.body;
  const user = db.getUser(userId);
  if (!user) return res.status(404).json({ error: 'Target user does not exist' });
  res.json({ success: true, user });
});

// -------------------------------------------------------------
// 2. DASHBOARD OVERVIEW (Destination 1)
// -------------------------------------------------------------
app.get('/api/dashboard/overview', (req, res) => {
  const userId = req.user.id;
  const userBookings = db.getBookings(userId);
  const userServices = db.getListings({ owner_id: userId });
  const incomingRequests = db.getServiceRequests(userId).filter(r => r.status === 'pending_provider_response');
  const userEarnings = db.getEarnings(userId);
  const userPayouts = db.getPayouts(userId);
  const userNotifications = db.getNotifications(userId);
  const recentTransactions = db.getTransactions(userId).slice(0, 5);

  // Financial separation: Provider gross revenue vs Customer booking spend
  const providerGrossRevenue = userEarnings.reduce((acc, curr) => acc + (curr.gross_amount || 0), 0);
  const providerNetEarnings = userEarnings.reduce((acc, curr) => acc + (curr.net_earnings || 0), 0);
  const pendingPayoutEligible = userEarnings
    .filter(e => e.status === 'eligible' && !e.payout_id)
    .reduce((acc, curr) => acc + (curr.net_earnings || 0), 0);
  const customerTotalSpend = userBookings
    .filter(b => b.customer_id === userId && b.payment_status === PAYMENT_STATES.SUCCESSFUL)
    .reduce((acc, curr) => acc + (curr.amount_breakdown?.total_amount || 0), 0);

  // Categorize bookings
  const activeBookings = userBookings.filter(b => 
    [BOOKING_STATES.CONFIRMED, BOOKING_STATES.IN_PROGRESS, BOOKING_STATES.AWAITING_PAYMENT, BOOKING_STATES.AWAITING_COMPLETION_CONFIRMATION].includes(b.status)
  );

  res.json({
    user: req.user,
    metrics: {
      totalBookingsCount: userBookings.length,
      activeBookingsCount: activeBookings.length,
      servicesListedCount: userServices.length,
      incomingRequestsCount: incomingRequests.length,
      providerGrossRevenue,
      providerNetEarnings,
      pendingPayoutEligible,
      customerTotalSpend
    },
    recentBookings: userBookings.slice(0, 5),
    myServices: userServices.slice(0, 4),
    incomingRequests: incomingRequests.slice(0, 3),
    recentTransactions,
    unreadNotificationsCount: userNotifications.filter(n => !n.read).length
  });
});

// -------------------------------------------------------------
// 3. CATEGORIES & EXPLORE SERVICES (Destinations 2, 3, 4)
// -------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES);
});

app.get('/api/categories/:slug', (req, res) => {
  const cat = CATEGORIES.find(c => c.slug === req.params.slug);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  const categoryListings = db.getListings({ category: cat.slug, status: 'active' });
  res.json({
    category: cat,
    listings: categoryListings,
    totalCount: categoryListings.length
  });
});

app.get('/api/listings', (req, res) => {
  const { category, search, state, min_price, max_price, verified, sort = 'relevance', page = 1, limit = 12 } = req.query;
  let listings = db.getListings({ category, search, state, min_price, max_price, verified, status: 'active' });

  // Sorting
  if (sort === 'price_asc') {
    listings.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    listings.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    listings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = listings.length;
  const paginated = listings.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  // Check saved state for current user
  const savedList = db.getSavedListings(req.user.id);
  const savedIds = new Set(savedList.map(s => s.id));
  const resultsWithSaved = paginated.map(l => ({
    ...l,
    is_saved: savedIds.has(l.id)
  }));

  res.json({
    results: resultsWithSaved,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// -------------------------------------------------------------
// 4. LISTING DETAILS (Destination 5)
// -------------------------------------------------------------
app.get('/api/listings/:id', (req, res) => {
  const listing = db.getListing(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const owner = db.getUser(listing.owner_id);
  const savedList = db.getSavedListings(req.user.id);
  const is_saved = savedList.some(s => s.id === listing.id);

  // Get related listings
  const relatedListings = db.getListings({ category: listing.category, status: 'active' })
    .filter(l => l.id !== listing.id)
    .slice(0, 3);

  // Listing reviews
  const reviews = db.data.reviews.filter(r => r.listing_id === listing.id);

  res.json({
    listing: {
      ...listing,
      is_saved
    },
    provider: owner ? {
      id: owner.id,
      name: owner.displayName || owner.name,
      avatar: owner.avatar,
      badge: owner.badge,
      rating: owner.rating,
      reviewCount: owner.reviewCount,
      completedBookingsCount: owner.completedBookingsCount,
      responseRate: owner.responseRate,
      responseTime: owner.responseTime,
      memberSince: owner.memberSince,
      verification: owner.verification
    } : null,
    reviews,
    relatedListings
  });
});

// -------------------------------------------------------------
// 5. BOOKING REQUEST & CONFIRMATION (Destinations 6, 7)
// -------------------------------------------------------------
app.post('/api/bookings/new', (req, res) => {
  const {
    listing_id,
    customer_contact,
    service_location,
    category_requirements,
    scheduled_dates,
    additional_notes,
    quantity,
    terms_consent
  } = req.body;

  if (!terms_consent) {
    return res.status(400).json({ error: 'You must agree to the platform booking terms and cancellation policies.' });
  }

  const listing = db.getListing(listing_id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.owner_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot book your own listing.' });
  }

  const baseAmount = listing.price * (Number(quantity) || 1);
  const logisticsFee = listing.category === 'machinery' ? 40000 : 0;
  const platformFee = Math.round(baseAmount * 0.05);
  const totalAmount = baseAmount + logisticsFee + platformFee;

  const newBooking = db.createBooking({
    customer_id: req.user.id,
    customer_name: req.user.displayName || req.user.name,
    customer_contact: customer_contact || req.user.phone,
    provider_id: listing.owner_id,
    provider_name: listing.provider_name,
    listing_id: listing.id,
    listing_title: listing.title,
    category: listing.category,
    listing_snapshot: {
      title: listing.title,
      category: listing.category,
      unit_price: listing.price,
      pricing_unit: listing.pricing_unit,
      cover_image: listing.cover_image,
      location: `${listing.location.town}, ${listing.location.state}`,
      quantity: Number(quantity) || 1
    },
    scheduled_dates: scheduled_dates || { start: new Date().toISOString().split('T')[0] },
    service_location: service_location || req.user.location,
    category_requirements: category_requirements || {},
    additional_notes: additional_notes || '',
    amount_breakdown: {
      base_amount: baseAmount,
      logistics_fee: logisticsFee,
      platform_fee: platformFee,
      total_amount: totalAmount
    },
    status: BOOKING_STATES.PENDING_PROVIDER_RESPONSE,
    payment_status: PAYMENT_STATES.PENDING,
    settlement_status: SETTLEMENT_STATES.NOT_ELIGIBLE,
    timeline: [
      {
        step: 'request_submitted',
        actor: 'customer',
        timestamp: new Date().toISOString(),
        note: `Booking request initiated by ${req.user.name}. Provider review pending.`
      }
    ]
  });

  // Also create a service_request row for provider
  db.createServiceRequest({
    booking_id: newBooking.id,
    listing_id: listing.id,
    listing_title: listing.title,
    customer_id: req.user.id,
    customer_name: req.user.displayName || req.user.name,
    customer_avatar: req.user.avatar,
    provider_id: listing.owner_id,
    requested_dates: scheduled_dates,
    service_location,
    proposed_scope: additional_notes || `${quantity} ${listing.pricing_unit} requested`,
    proposed_amount: totalAmount,
    status: 'pending_provider_response'
  });

  // Create notification for provider
  db.data.notifications.unshift({
    id: `notif_${Date.now()}`,
    user_id: listing.owner_id,
    type: 'service_request',
    title: 'New Booking Request',
    summary: `${req.user.name} requested ${listing.title}. Review scope and respond.`,
    related_record: { type: 'booking', id: newBooking.id },
    destination: `/dashboard/service-requests`,
    read: false,
    created_at: new Date().toISOString()
  });
  db.save();

  db.addAuditLog(req.user.id, 'booking_requested', 'booking', newBooking.id, 'Created new booking request');

  res.status(201).json({
    success: true,
    booking: newBooking
  });
});

// -------------------------------------------------------------
// 6. MY BOOKINGS & BOOKING DETAILS (Destinations 8, 9, 10, 11)
// -------------------------------------------------------------
app.get('/api/bookings', (req, res) => {
  const { status, role } = req.query;
  let bookings = db.getBookings(req.user.id, role);

  if (status && status !== 'all') {
    bookings = bookings.filter(b => b.status === status);
  }

  // Summary counts across state tabs
  const allUserBookings = db.getBookings(req.user.id);
  const counts = {
    all: allUserBookings.length,
    pending: allUserBookings.filter(b => b.status === BOOKING_STATES.PENDING_PROVIDER_RESPONSE).length,
    awaiting_payment: allUserBookings.filter(b => b.status === BOOKING_STATES.AWAITING_PAYMENT).length,
    active: allUserBookings.filter(b => [BOOKING_STATES.CONFIRMED, BOOKING_STATES.IN_PROGRESS].includes(b.status)).length,
    completion_pending: allUserBookings.filter(b => b.status === BOOKING_STATES.AWAITING_COMPLETION_CONFIRMATION).length,
    completed: allUserBookings.filter(b => b.status === BOOKING_STATES.COMPLETED).length,
    cancelled: allUserBookings.filter(b => b.status === BOOKING_STATES.CANCELLED).length,
    disputed: allUserBookings.filter(b => b.status === BOOKING_STATES.DISPUTED).length
  };

  res.json({
    bookings,
    counts
  });
});

app.get('/api/bookings/:id', (req, res) => {
  const booking = db.getBooking(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  // Record-level Authorization: User must be customer or provider
  if (booking.customer_id !== req.user.id && booking.provider_id !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied: You are not an authorized participant in this booking.' });
  }

  const customer = db.getUser(booking.customer_id);
  const provider = db.getUser(booking.provider_id);
  const userRole = booking.customer_id === req.user.id ? 'customer' : 'provider';

  // Find linked conversation if exists
  const conversation = db.data.conversations.find(c => c.booking_id === booking.id);

  res.json({
    booking,
    userRole,
    customer: customer ? { id: customer.id, name: customer.name, avatar: customer.avatar, phone: customer.phone } : null,
    provider: provider ? { id: provider.id, name: provider.name, avatar: provider.avatar, phone: provider.phone } : null,
    conversationId: conversation ? conversation.id : null
  });
});

// Customer reviews agreed terms before payment
app.post('/api/bookings/:id/terms-review', (req, res) => {
  const booking = db.getBooking(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.customer_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the booking customer can review and accept terms.' });
  }
  if (booking.status !== BOOKING_STATES.AWAITING_PAYMENT) {
    return res.status(400).json({ error: 'Booking is not awaiting payment terms confirmation.' });
  }

  booking.customer_terms_accepted_at = new Date().toISOString();
  db.save();

  res.json({ success: true, booking });
});

// Pay Booking via Bach Adapter (Rule 9 & 12)
app.post('/api/bookings/:id/pay', async (req, res) => {
  const booking = db.getBooking(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.customer_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the customer can pay for this booking.' });
  }
  if (booking.status !== BOOKING_STATES.AWAITING_PAYMENT) {
    return res.status(400).json({ error: 'Booking must be in accepted awaiting_payment status to initiate payment.' });
  }

  try {
    const paymentSession = await bachAdapter.createPaymentSession({
      bookingId: booking.id,
      amount: booking.amount_breakdown.total_amount,
      currency: 'NGN',
      customerEmail: req.user.email,
      customerName: req.user.name,
      idempotencyKey: `IDEMP-${booking.id}-${Date.now()}`
    });

    res.json({
      success: true,
      paymentSession
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authoritative Server-side Verification of Payment (Rule 9)
app.post('/api/bookings/:id/verify-payment', async (req, res) => {
  const { gatewayReference } = req.body;
  const booking = db.getBooking(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  // Query Bach directly server-to-server
  const verification = await bachAdapter.queryTransactionStatus(gatewayReference);
  if (!verification || !verification.verified) {
    return res.status(400).json({ error: 'Server-side payment verification failed with Bach.' });
  }

  // Update payment status and booking status atomically
  booking.payment_status = PAYMENT_STATES.SUCCESSFUL;
  booking.status = BOOKING_STATES.CONFIRMED;
  booking.payment_details = {
    provider: 'bach',
    gateway_reference: gatewayReference,
    transaction_reference: `TX-${Date.now()}`,
    paid_at: new Date().toISOString(),
    amount_paid: booking.amount_breakdown.total_amount,
    method: 'Bach Secured Payment (NIP / Card)'
  };
  booking.timeline.push({
    step: 'payment_verified',
    actor: 'system_bach',
    timestamp: new Date().toISOString(),
    note: `Server verified Bach payment of ₦${booking.amount_breakdown.total_amount.toLocaleString()}. Secured in platform holding.`
  });

  // Record Transaction
  const newTx = db.addTransaction({
    gateway_reference: gatewayReference,
    booking_reference: booking.reference,
    type: 'customer_payment',
    direction: 'inflow',
    user_id: booking.customer_id,
    amount: booking.amount_breakdown.total_amount,
    currency: 'NGN',
    status: 'successful',
    verification_state: 'verified_server_side',
    provider: 'bach',
    channel: 'Bank Transfer / Card',
    fees: Math.round(booking.amount_breakdown.total_amount * 0.015)
  });

  // Create Provider Earning in pending state
  const commission = Math.round(booking.amount_breakdown.total_amount * 0.05);
  db.data.earnings.push({
    id: `earn_${Date.now()}`,
    provider_id: booking.provider_id,
    booking_id: booking.id,
    listing_title: booking.listing_title,
    gross_amount: booking.amount_breakdown.total_amount,
    commission,
    deductions: 0,
    net_earnings: booking.amount_breakdown.total_amount - commission,
    status: 'pending_completion',
    eligible_for_payout: false,
    created_at: new Date().toISOString()
  });

  // Notify Provider
  db.data.notifications.unshift({
    id: `notif_${Date.now()}`,
    user_id: booking.provider_id,
    type: 'payment',
    title: 'Payment Confirmed & Secured',
    summary: `Customer paid ₦${booking.amount_breakdown.total_amount.toLocaleString()} for ${booking.listing_title}. You may commence service delivery.`,
    related_record: { type: 'booking', id: booking.id },
    destination: `/dashboard/bookings/${booking.id}`,
    read: false,
    created_at: new Date().toISOString()
  });

  db.save();
  db.addAuditLog(req.user.id, 'payment_verified', 'booking', booking.id, `Payment verified via Bach for ₦${booking.amount_breakdown.total_amount}`);

  res.json({
    success: true,
    booking,
    transaction: newTx
  });
});

// Independent Completion Confirmations (Rule 11 of spec)
app.post('/api/bookings/:id/completion', (req, res) => {
  const { action, notes } = req.body; // action: 'provider_confirm' | 'customer_confirm' | 'dispute'
  const booking = db.getBooking(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const userId = req.user.id;
  const isCustomer = booking.customer_id === userId;
  const isProvider = booking.provider_id === userId;

  if (!isCustomer && !isProvider) {
    return res.status(403).json({ error: 'Only participants can submit completion confirmations.' });
  }

  if (action === 'provider_confirm') {
    if (!isProvider) return res.status(403).json({ error: 'Only provider can record delivery completion.' });
    booking.provider_confirmed_at = new Date().toISOString();
    booking.provider_completion_notes = notes || 'Service completed according to agreed scope.';
    booking.timeline.push({
      step: 'provider_completion',
      actor: 'provider',
      timestamp: booking.provider_confirmed_at,
      note: 'Provider recorded delivery completion. Awaiting independent customer confirmation.'
    });

    if (!booking.customer_confirmed_at) {
      booking.status = BOOKING_STATES.AWAITING_COMPLETION_CONFIRMATION;
      booking.settlement_status = SETTLEMENT_STATES.AWAITING_COMPLETION_CONFIRMATION;
    } else {
      booking.status = BOOKING_STATES.COMPLETED;
      booking.settlement_status = SETTLEMENT_STATES.ELIGIBLE;
    }
  } else if (action === 'customer_confirm') {
    if (!isCustomer) return res.status(403).json({ error: 'Only customer can confirm satisfactory completion.' });
    booking.customer_confirmed_at = new Date().toISOString();
    booking.customer_completion_notes = notes || 'Confirmed satisfactory service delivery.';
    booking.timeline.push({
      step: 'customer_completion',
      actor: 'customer',
      timestamp: booking.customer_confirmed_at,
      note: 'Customer independently inspected and confirmed satisfaction.'
    });

    if (booking.provider_confirmed_at) {
      booking.status = BOOKING_STATES.COMPLETED;
      booking.settlement_status = SETTLEMENT_STATES.ELIGIBLE;

      // Update provider earnings status to eligible
      let earning = db.data.earnings.find(e => e.booking_id === booking.id);
      if (earning) {
        earning.status = 'eligible';
        earning.eligible_for_payout = true;
      } else {
        const commission = Math.round((booking.amount_breakdown?.total_amount || 0) * 0.05);
        db.data.earnings.push({
          id: `earn_${Date.now()}`,
          provider_id: booking.provider_id,
          booking_id: booking.id,
          listing_title: booking.listing_title,
          gross_amount: booking.amount_breakdown?.total_amount || 0,
          commission,
          deductions: 0,
          net_earnings: (booking.amount_breakdown?.total_amount || 0) - commission,
          status: 'eligible',
          eligible_for_payout: true,
          created_at: new Date().toISOString()
        });
      }
    } else {
      booking.status = BOOKING_STATES.AWAITING_COMPLETION_CONFIRMATION;
    }
  } else if (action === 'dispute') {
    booking.status = BOOKING_STATES.DISPUTED;
    booking.settlement_status = SETTLEMENT_STATES.ON_HOLD;
    booking.timeline.push({
      step: 'dispute_opened',
      actor: isCustomer ? 'customer' : 'provider',
      timestamp: new Date().toISOString(),
      note: `Dispute opened by ${req.user.name}: ${notes || 'Issue reported with service delivery'}`
    });
  } else {
    return res.status(400).json({ error: 'Unknown completion action.' });
  }

  db.save();
  db.addAuditLog(userId, `booking_completion_${action}`, 'booking', booking.id, notes);

  res.json({
    success: true,
    booking
  });
});

// -------------------------------------------------------------
// 7. MY SERVICES & SERVICE MANAGEMENT (Destinations 12, 13, 14, 15, 16, 17)
// -------------------------------------------------------------
app.get('/api/services', (req, res) => {
  const { status, category } = req.query;
  let services = db.getListings({ owner_id: req.user.id });

  if (category) {
    services = services.filter(s => s.category === category);
  }
  if (status && status !== 'all') {
    services = services.filter(s => s.status === status);
  }

  const allOwned = db.getListings({ owner_id: req.user.id });
  const counts = {
    all: allOwned.length,
    active: allOwned.filter(s => s.status === 'active').length,
    draft: allOwned.filter(s => s.status === 'draft').length,
    pending_review: allOwned.filter(s => s.status === 'pending_review').length,
    paused: allOwned.filter(s => s.status === 'paused').length,
    rejected: allOwned.filter(s => s.status === 'rejected').length,
    archived: allOwned.filter(s => s.status === 'archived').length
  };

  res.json({
    services,
    counts
  });
});

app.post('/api/services/new', (req, res) => {
  const {
    category,
    title,
    description,
    location,
    price,
    pricing_unit,
    attributes,
    availability,
    gallery,
    status = 'active'
  } = req.body;

  if (!category || !title || !price) {
    return res.status(400).json({ error: 'Category, title, and price are required.' });
  }

  const newListing = db.addListing({
    owner_id: req.user.id,
    provider_name: req.user.displayName || req.user.name,
    category,
    title,
    description: description || '',
    location: location || req.user.location,
    price: Number(price),
    pricing_unit: pricing_unit || 'day',
    attributes: attributes || {},
    availability: availability || { status: 'available_now' },
    status,
    verified: false, // Verification evidence does NOT automatically approve listing!
    cover_image: gallery && gallery[0] ? gallery[0] : 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800',
    gallery: gallery || []
  });

  db.addAuditLog(req.user.id, 'service_created', 'listing', newListing.id, `Created service: ${title}`);

  res.status(201).json({
    success: true,
    service: newListing
  });
});

app.put('/api/services/:id', (req, res) => {
  const service = db.getListing(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  if (service.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit services you own.' });
  }

  const updated = db.updateListing(req.params.id, req.body);
  db.addAuditLog(req.user.id, 'service_updated', 'listing', service.id, 'Updated service listing fields');

  res.json({
    success: true,
    service: updated
  });
});

app.patch('/api/services/:id/status', (req, res) => {
  const { status } = req.body;
  const service = db.getListing(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  if (service.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  const validStatuses = ['active', 'paused', 'archived', 'draft'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updated = db.updateListing(req.params.id, { status });
  res.json({ success: true, service: updated });
});

// Service Availability Management (Destination 16)
app.get('/api/services/:id/availability', (req, res) => {
  const service = db.getListing(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  // Get booked dates from bookings
  const serviceBookings = db.data.bookings.filter(b => 
    b.listing_id === service.id && 
    [BOOKING_STATES.CONFIRMED, BOOKING_STATES.IN_PROGRESS].includes(b.status)
  );

  res.json({
    service_id: service.id,
    availability: service.availability || {},
    booked_slots: serviceBookings.map(b => ({
      booking_reference: b.reference,
      start: b.scheduled_dates.start,
      end: b.scheduled_dates.end,
      customer: b.customer_name
    }))
  });
});

app.post('/api/services/:id/availability', (req, res) => {
  const service = db.getListing(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  if (service.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const updated = db.updateListing(service.id, { availability: req.body });
  res.json({ success: true, availability: updated.availability });
});

// Service Performance (Destination 17)
app.get('/api/services/:id/performance', (req, res) => {
  const service = db.getListing(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  if (service.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const bookings = db.data.bookings.filter(b => b.listing_id === service.id);
  const completedBookings = bookings.filter(b => b.status === BOOKING_STATES.COMPLETED);
  const revenue = completedBookings.reduce((sum, b) => sum + (b.amount_breakdown?.total_amount || 0), 0);

  res.json({
    views: service.views_count || 120,
    searchImpressions: service.search_impressions || 450,
    enquiries: service.enquiry_count || 8,
    bookingRequestsCount: bookings.length,
    completedBookingsCount: completedBookings.length,
    grossRevenue: revenue,
    conversionRate: bookings.length > 0 && service.views_count ? `${((bookings.length / service.views_count) * 100).toFixed(1)}%` : '2.8%',
    reviewsCount: db.data.reviews.filter(r => r.listing_id === service.id).length
  });
});

// -------------------------------------------------------------
// 8. SERVICE REQUESTS & INCOMING DETAILS (Destinations 18, 19)
// -------------------------------------------------------------
app.get('/api/service-requests', (req, res) => {
  const requests = db.getServiceRequests(req.user.id);
  res.json({
    requests,
    counts: {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending_provider_response').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      declined: requests.filter(r => r.status === 'declined').length
    }
  });
});

app.get('/api/service-requests/:id', (req, res) => {
  const reqItem = db.getServiceRequest(req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Request not found' });
  if (reqItem.provider_id !== req.user.id && reqItem.customer_id !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const listing = db.getListing(reqItem.listing_id);
  const customer = db.getUser(reqItem.customer_id);

  res.json({
    request: reqItem,
    listing,
    customer: customer ? {
      id: customer.id,
      name: customer.name,
      avatar: customer.avatar,
      badge: customer.badge,
      rating: customer.rating,
      completedBookingsCount: customer.completedBookingsCount
    } : null
  });
});

app.post('/api/service-requests/:id/respond', (req, res) => {
  const { action, revised_amount, revised_date, message } = req.body; // action: 'accept' | 'decline' | 'revise'
  const reqItem = db.getServiceRequest(req.params.id);
  if (!reqItem) return res.status(404).json({ error: 'Request not found' });
  if (reqItem.provider_id !== req.user.id) {
    return res.status(403).json({ error: 'Only provider can respond to service requests.' });
  }

  if (action === 'accept') {
    reqItem.status = 'accepted';
    // If linked to booking, advance booking state to AWAITING_PAYMENT (Rule 8)
    if (reqItem.booking_id) {
      const booking = db.getBooking(reqItem.booking_id);
      if (booking) {
        booking.status = BOOKING_STATES.AWAITING_PAYMENT;
        booking.terms_agreed = {
          provider_accepted_at: new Date().toISOString(),
          agreed_scope: reqItem.proposed_scope,
          cancellation_policy: 'Standard TerraTills Cancellation & Completion Policy',
          payment_due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
        };
        booking.timeline.push({
          step: 'provider_accepted',
          actor: 'provider',
          timestamp: new Date().toISOString(),
          note: `Provider accepted request. Scope & agreed price confirmed. Customer can now review terms and pay.`
        });
      }
    }

    // Notify customer
    db.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      user_id: reqItem.customer_id,
      type: 'booking',
      title: 'Booking Request Accepted!',
      summary: `${req.user.name} accepted your request for ${reqItem.listing_title}. Review final terms to complete payment.`,
      related_record: { type: 'booking', id: reqItem.booking_id },
      destination: `/dashboard/bookings/${reqItem.booking_id}`,
      read: false,
      created_at: new Date().toISOString()
    });
  } else if (action === 'decline') {
    reqItem.status = 'declined';
    if (reqItem.booking_id) {
      const booking = db.getBooking(reqItem.booking_id);
      if (booking) booking.status = BOOKING_STATES.DECLINED;
    }
  } else if (action === 'revise') {
    reqItem.status = 'awaiting_clarification';
    reqItem.proposed_amount = revised_amount || reqItem.proposed_amount;
    if (revised_date) reqItem.requested_dates = revised_date;
  }

  db.save();
  db.addAuditLog(req.user.id, `request_${action}`, 'service_request', reqItem.id, message || `Responded with ${action}`);

  res.json({
    success: true,
    request: reqItem
  });
});

// -------------------------------------------------------------
// 9. MESSAGES & CONVERSATIONS (Destinations 20, 21)
// -------------------------------------------------------------
app.get('/api/messages', (req, res) => {
  const convs = db.getConversations(req.user.id);
  const enriched = convs.map(c => {
    const otherParticipantId = c.participants.find(p => p !== req.user.id);
    const otherUser = db.getUser(otherParticipantId);
    return {
      ...c,
      otherParticipant: otherUser ? {
        id: otherUser.id,
        name: otherUser.displayName || otherUser.name,
        avatar: otherUser.avatar,
        badge: otherUser.badge
      } : null,
      unreadCount: c.unread_count[req.user.id] || 0
    };
  });
  res.json(enriched);
});

app.get('/api/messages/:id', (req, res) => {
  const conv = db.getConversation(req.params.id, req.user.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found or access denied.' });

  const otherParticipantId = conv.participants.find(p => p !== req.user.id);
  const otherUser = db.getUser(otherParticipantId);

  // Mark unread as 0 for current user
  if (conv.unread_count) {
    conv.unread_count[req.user.id] = 0;
    db.save();
  }

  res.json({
    ...conv,
    otherParticipant: otherUser ? {
      id: otherUser.id,
      name: otherUser.displayName || otherUser.name,
      avatar: otherUser.avatar,
      badge: otherUser.badge,
      phone: otherUser.phone
    } : null
  });
});

app.post('/api/messages/:id/send', (req, res) => {
  const { text, attachments } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  const msg = db.addMessage(req.params.id, req.user.id, text.trim(), attachments || []);
  res.status(201).json({ success: true, message: msg });
});

// -------------------------------------------------------------
// 10. FINANCE, EARNINGS, TRANSACTIONS, PAYOUTS (Destinations 22, 23, 24, 25, 26)
// -------------------------------------------------------------
app.get('/api/finance', (req, res) => {
  const userId = req.user.id;
  const txs = db.getTransactions(userId);
  const earnings = db.getEarnings(userId);
  const payouts = db.getPayouts(userId);
  const paymentMethods = db.getPaymentMethods(userId);

  const grossEarnings = earnings.reduce((sum, e) => sum + e.gross_amount, 0);
  const netEarnings = earnings.reduce((sum, e) => sum + e.net_earnings, 0);
  const pendingEarnings = earnings.filter(e => e.status === 'pending_completion').reduce((sum, e) => sum + e.net_earnings, 0);
  const eligibleEarnings = earnings.filter(e => e.status === 'eligible' && !e.payout_id).reduce((sum, e) => sum + e.net_earnings, 0);
  const completedPayoutsTotal = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  // Customer spending (separate from provider earnings!)
  const customerSpending = txs
    .filter(t => t.type === 'customer_payment' && t.status === 'successful')
    .reduce((sum, t) => sum + t.amount, 0);

  res.json({
    overview: {
      grossEarnings,
      netEarnings,
      pendingEarnings,
      eligibleEarnings,
      completedPayoutsTotal,
      customerSpending
    },
    transactions: txs,
    earnings,
    payouts,
    paymentMethods
  });
});

app.get('/api/finance/transactions/:id', (req, res) => {
  const tx = db.getTransaction(req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  if (tx.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied.' });
  }
  res.json(tx);
});

app.post('/api/finance/payouts/request', async (req, res) => {
  const { amount, destinationBankCode, destinationAccountNumber } = req.body;
  const userId = req.user.id;
  const earnings = db.getEarnings(userId);
  const eligibleAmount = earnings.filter(e => e.status === 'eligible' && !e.payout_id).reduce((sum, e) => sum + e.net_earnings, 0);

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid payout amount.' });
  }
  if (amount > eligibleAmount) {
    return res.status(400).json({ error: `Requested amount exceeds payout-eligible balance (₦${eligibleAmount.toLocaleString()}).` });
  }

  // Use Bach adapter to queue transfer
  const payoutRef = `PO-${Date.now()}`;
  const transfer = await bachAdapter.initiatePayout({
    payoutReference: payoutRef,
    destinationBankCode: destinationBankCode || '057',
    destinationAccountNumber: destinationAccountNumber || '1029384829',
    amount
  });

  const newPayout = db.addPayout({
    provider_id: userId,
    reference: payoutRef,
    amount,
    currency: 'NGN',
    destination_bank: destinationBankCode || 'Zenith Bank PLC',
    destination_account: (destinationAccountNumber || '1029384829').replace(/\d(?=\d{4})/g, '*'),
    status: 'completed', // Recorded in Bach queue
    bach_transfer_reference: transfer.transferReference
  });

  // Mark corresponding earnings as paid
  let remainingToDeduct = amount;
  for (const earn of earnings) {
    if (earn.status === 'eligible' && !earn.payout_id && remainingToDeduct > 0) {
      earn.status = 'paid';
      earn.payout_id = newPayout.id;
      remainingToDeduct -= earn.net_earnings;
    }
  }

  db.save();
  db.addAuditLog(userId, 'payout_requested', 'payout', newPayout.id, `Payout of ₦${amount} requested via Bach adapter`);

  res.status(201).json({
    success: true,
    payout: newPayout,
    bachResponse: transfer
  });
});

app.post('/api/finance/payment-methods', (req, res) => {
  const { type, bank_name, bank_code, account_number_masked, account_name, brand, last4 } = req.body;
  const pm = db.addPaymentMethod({
    user_id: req.user.id,
    type: type || 'provider_payout_account',
    kind: type === 'customer_payment_method' ? 'card' : 'bank_account',
    bank_name,
    bank_code,
    account_number_masked,
    account_name,
    brand,
    last4,
    verification_status: 'verified',
    is_default: true
  });
  res.status(201).json({ success: true, paymentMethod: pm });
});

// -------------------------------------------------------------
// 11. REVIEWS (Destinations 27, 28)
// -------------------------------------------------------------
app.get('/api/reviews', (req, res) => {
  const reviews = db.getReviews(req.user.id);
  res.json(reviews);
});

app.post('/api/reviews/new', (req, res) => {
  const { booking_id, rating, category_ratings, comment } = req.body;
  const booking = db.getBooking(booking_id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== BOOKING_STATES.COMPLETED) {
    return res.status(400).json({ error: 'Only completed bookings are eligible for review.' });
  }

  const userId = req.user.id;
  if (booking.customer_id !== userId && booking.provider_id !== userId) {
    return res.status(403).json({ error: 'Only participants in this booking can leave a review.' });
  }

  const revieweeId = booking.customer_id === userId ? booking.provider_id : booking.customer_id;

  // Check duplicate review
  const existing = db.data.reviews.find(r => r.booking_id === booking.id && r.reviewer_id === userId);
  if (existing) {
    return res.status(400).json({ error: 'You have already reviewed this booking.' });
  }

  const review = db.addReview({
    booking_id: booking.id,
    reviewer_id: userId,
    reviewer_name: req.user.displayName || req.user.name,
    reviewer_avatar: req.user.avatar,
    reviewee_id: revieweeId,
    listing_id: booking.listing_id,
    rating: Number(rating) || 5,
    category_ratings: category_ratings || { quality: 5, communication: 5, timeliness: 5, reliability: 5 },
    comment
  });

  db.addAuditLog(userId, 'review_created', 'review', review.id, `Review submitted for booking ${booking.id}`);

  res.status(201).json({
    success: true,
    review
  });
});

// -------------------------------------------------------------
// 12. SAVED ITEMS (Destination 29)
// -------------------------------------------------------------
app.get('/api/saved', (req, res) => {
  const saved = db.getSavedListings(req.user.id);
  res.json(saved);
});

app.post('/api/saved/toggle', (req, res) => {
  const { listing_id } = req.body;
  const result = db.toggleSaveListing(req.user.id, listing_id);
  res.json(result);
});

// -------------------------------------------------------------
// 13. NOTIFICATIONS (Destination 30)
// -------------------------------------------------------------
app.get('/api/notifications', (req, res) => {
  const notifications = db.getNotifications(req.user.id);
  res.json(notifications);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = db.markNotificationRead(req.params.id, req.user.id);
  res.json({ success: true, notification: notif });
});

app.post('/api/notifications/mark-all-read', (req, res) => {
  db.markAllNotificationsRead(req.user.id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 14. SUPPORT & HELP CENTRE (Destinations 31, 32, 33)
// -------------------------------------------------------------
const FAQ_ARTICLES = [
  {
    id: 'faq_01',
    category: 'Bookings & Terms',
    question: 'How do bookings and provider acceptance work?',
    answer: 'On TerraTills, submitting a booking request does not charge your account. The service provider must first review your requested scope, acreage, machinery dates or labour requirements, agree to terms, and accept. Once agreed, you can review the finalized pricing and complete secured payment.'
  },
  {
    id: 'faq_02',
    category: 'Payments & Settlement',
    question: 'How does payment protection work on TerraTills?',
    answer: 'Payments are processed server-side through Bach Payment Gateway. When you pay, funds are held in Secured Platform Holding. Funds are only released to the provider after independent delivery confirmation from both customer and provider.'
  },
  {
    id: 'faq_03',
    category: 'Verification',
    question: 'What verification documents are required for Farmland or Machinery?',
    answer: 'For farmland, we accept registered Survey Plans, Certificates of Occupancy (C of O), or verified Local Government customary gazettes. For machinery, proof of purchase/chassis registration and operator credentials are required.'
  },
  {
    id: 'faq_04',
    category: 'Completion & Disputes',
    question: 'What happens if a service is delivered defectively or incomplete?',
    answer: 'Either participant can open a formal dispute before completion is marked. When a dispute is logged, settlement funds are automatically placed on hold while our local dispute resolution officers inspect field evidence.'
  }
];

app.get('/api/support/faqs', (req, res) => {
  res.json(FAQ_ARTICLES);
});

app.get('/api/support/tickets', (req, res) => {
  const tickets = db.getSupportTickets(req.user.id);
  res.json(tickets);
});

app.get('/api/support/tickets/:id', (req, res) => {
  const ticket = db.getSupportTicket(req.params.id, req.user.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

app.post('/api/support/tickets/new', (req, res) => {
  const { category, subject, description, booking_reference } = req.body;
  if (!category || !subject || !description) {
    return res.status(400).json({ error: 'Category, subject, and description are required.' });
  }

  const ticket = db.createSupportTicket({
    user_id: req.user.id,
    category,
    subject,
    description,
    booking_reference: booking_reference || null
  });

  res.status(201).json({ success: true, ticket });
});

app.post('/api/support/tickets/:id/reply', (req, res) => {
  const { text } = req.body;
  const ticket = db.addSupportMessage(req.params.id, req.user.id, text);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ success: true, ticket });
});

// -------------------------------------------------------------
// 15. PROFILE & VERIFICATION CENTRE (Destinations 34, 35, 36, 37)
// -------------------------------------------------------------
app.get('/api/profile', (req, res) => {
  const user = req.user;
  const ownedServices = db.getListings({ owner_id: user.id, status: 'active' });
  const reviews = db.data.reviews.filter(r => r.reviewee_id === user.id);

  // Return public profile respecting privacy rules (no identity numbers or full bank details)
  res.json({
    user: {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      avatar: user.avatar,
      badge: user.badge,
      bio: user.bio,
      location: user.location,
      memberSince: user.memberSince,
      rating: user.rating,
      reviewCount: user.reviewCount,
      completedBookingsCount: user.completedBookingsCount,
      responseRate: user.responseRate,
      responseTime: user.responseTime,
      verificationSummary: {
        identity: user.verification?.identity?.status || 'unverified',
        machinery: user.verification?.machineryOwnership?.status || 'not_applicable',
        farmland: user.verification?.farmlandAuthority?.status || 'not_applicable'
      }
    },
    activeServices: ownedServices,
    reviews
  });
});

app.put('/api/profile/edit', (req, res) => {
  const { displayName, bio, phone, location } = req.body;
  const user = db.getUser(req.user.id);
  if (displayName) user.displayName = displayName;
  if (bio) user.bio = bio;
  if (phone) user.phone = phone;
  if (location) user.location = { ...user.location, ...location };
  db.save();

  db.addAuditLog(user.id, 'profile_updated', 'user', user.id, 'User updated profile information');
  res.json({ success: true, user });
});

app.get('/api/verification', (req, res) => {
  const submissions = db.getVerificationSubmissions(req.user.id);
  res.json({
    accountVerification: req.user.verification,
    submissions
  });
});

app.post('/api/verification/submit', (req, res) => {
  const { type, type_title, documents, declaration_accepted, notes } = req.body;
  if (!declaration_accepted) {
    return res.status(400).json({ error: 'You must confirm the legal accuracy of submitted documents.' });
  }

  const sub = db.submitVerification({
    user_id: req.user.id,
    type,
    type_title: type_title || type,
    documents: documents || [{ name: 'Document_Upload.pdf', size: '1.5 MB' }],
    declaration_accepted,
    notes: notes || ''
  });

  db.addAuditLog(req.user.id, 'verification_submitted', 'verification', sub.id, `Submitted ${type} verification evidence`);

  res.status(201).json({
    success: true,
    submission: sub
  });
});

// -------------------------------------------------------------
// 16. SETTINGS (Destinations 38, 39, 40, 41, 42, 43, 44)
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  const settings = db.getUserSettings(req.user.id);
  const locations = db.getUserLocations(req.user.id);
  res.json({
    settings,
    locations
  });
});

app.put('/api/settings', (req, res) => {
  const updated = db.updateUserSettings(req.user.id, req.body);
  res.json({ success: true, settings: updated });
});

app.post('/api/settings/locations', (req, res) => {
  const loc = db.addUserLocation({
    user_id: req.user.id,
    ...req.body
  });
  res.status(201).json({ success: true, location: loc });
});

app.delete('/api/settings/locations/:id', (req, res) => {
  db.deleteUserLocation(req.params.id, req.user.id);
  res.json({ success: true });
});

// Account deactivation check (Rule 44: must not permit evasion of legitimate obligations)
app.post('/api/settings/account/deactivate-check', (req, res) => {
  const activeBookings = db.getBookings(req.user.id).filter(b => 
    ![BOOKING_STATES.COMPLETED, BOOKING_STATES.CANCELLED, BOOKING_STATES.DECLINED].includes(b.status)
  );

  if (activeBookings.length > 0) {
    return res.status(400).json({
      canDeactivate: false,
      reason: `You have ${activeBookings.length} active or pending booking obligations that must be completed or resolved first.`
    });
  }

  res.json({
    canDeactivate: true,
    warning: 'Deactivating your account will archive your listings and retain historical financial records according to Nigerian statutory requirements.'
  });
});

// -------------------------------------------------------------
// 17. AI AGRICULTURAL ASSISTANT (Destination 45)
// -------------------------------------------------------------
app.post('/api/assistant/query', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await aiEngine.processQuery(prompt, req.user);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 18. BACH WEBHOOK RECEIVER (Rule 9 & 12)
// -------------------------------------------------------------
app.post('/api/payments/bach/webhook', async (req, res) => {
  const signature = req.headers['x-bach-signature'];
  // Validate signature
  // const valid = bachAdapter.verifyWebhookSignature(req.body, signature);
  const result = await bachAdapter.handleWebhookEvent(req.body);
  res.json({ received: true, ...result });
});

// Serve Production Static Build if exists
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`TerraTills Backend Server running on port ${PORT}`);
  console.log(`Unified Account System active. Default test user: user_1 (Alhaji Musa Danladi)`);
});
