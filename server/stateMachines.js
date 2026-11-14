// Authoritative State Machine Definitions and Transition Guards for TerraTills
// Rules:
// 1. Booking, Payment, and Settlement are independent state machines.
// 2. Authoritative transitions occur only on the server.
// 3. Customer and provider roles are contextual per booking.

export const BOOKING_STATES = {
  DRAFT: 'draft',
  PENDING_PROVIDER_RESPONSE: 'pending_provider_response',
  AWAITING_CLARIFICATION: 'awaiting_clarification',
  ACCEPTED: 'accepted',
  AWAITING_PAYMENT: 'awaiting_payment',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  AWAITING_COMPLETION_CONFIRMATION: 'awaiting_completion_confirmation',
  COMPLETED: 'completed',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  EXPIRED: 'expired'
};

export const PAYMENT_STATES = {
  NOT_REQUIRED: 'not_required',
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  REVERSED: 'reversed',
  ON_HOLD: 'on_hold'
};

export const SETTLEMENT_STATES = {
  NOT_ELIGIBLE: 'not_eligible',
  AWAITING_COMPLETION_CONFIRMATION: 'awaiting_completion_confirmation',
  ON_HOLD: 'on_hold',
  ELIGIBLE: 'eligible',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  REVERSED: 'reversed'
};

// Permitted transitions for Booking State
const BOOKING_TRANSITIONS = {
  [BOOKING_STATES.DRAFT]: [BOOKING_STATES.PENDING_PROVIDER_RESPONSE, BOOKING_STATES.CANCELLED],
  [BOOKING_STATES.PENDING_PROVIDER_RESPONSE]: [
    BOOKING_STATES.ACCEPTED,
    BOOKING_STATES.AWAITING_CLARIFICATION,
    BOOKING_STATES.DECLINED,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.EXPIRED
  ],
  [BOOKING_STATES.AWAITING_CLARIFICATION]: [
    BOOKING_STATES.PENDING_PROVIDER_RESPONSE,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.DECLINED
  ],
  [BOOKING_STATES.ACCEPTED]: [
    BOOKING_STATES.AWAITING_PAYMENT,
    BOOKING_STATES.CONFIRMED,
    BOOKING_STATES.CANCELLED
  ],
  [BOOKING_STATES.AWAITING_PAYMENT]: [
    BOOKING_STATES.CONFIRMED,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.EXPIRED
  ],
  [BOOKING_STATES.CONFIRMED]: [
    BOOKING_STATES.IN_PROGRESS,
    BOOKING_STATES.CANCELLED,
    BOOKING_STATES.DISPUTED
  ],
  [BOOKING_STATES.IN_PROGRESS]: [
    BOOKING_STATES.AWAITING_COMPLETION_CONFIRMATION,
    BOOKING_STATES.DISPUTED
  ],
  [BOOKING_STATES.AWAITING_COMPLETION_CONFIRMATION]: [
    BOOKING_STATES.COMPLETED,
    BOOKING_STATES.DISPUTED
  ],
  [BOOKING_STATES.DISPUTED]: [
    BOOKING_STATES.COMPLETED,
    BOOKING_STATES.CANCELLED
  ],
  [BOOKING_STATES.COMPLETED]: [],
  [BOOKING_STATES.DECLINED]: [],
  [BOOKING_STATES.CANCELLED]: [],
  [BOOKING_STATES.EXPIRED]: []
};

/**
 * Validates if a booking state transition is allowed
 */
export function canTransitionBooking(currentState, nextState, actorRole) {
  const allowed = BOOKING_TRANSITIONS[currentState] || [];
  if (!allowed.includes(nextState)) {
    return { allowed: false, error: `Invalid transition from ${currentState} to ${nextState}` };
  }

  // Role permissions
  if (nextState === BOOKING_STATES.ACCEPTED || nextState === BOOKING_STATES.DECLINED) {
    if (actorRole !== 'provider') {
      return { allowed: false, error: 'Only the service provider can accept or decline a request.' };
    }
  }

  if (nextState === BOOKING_STATES.CANCELLED && currentState === BOOKING_STATES.PENDING_PROVIDER_RESPONSE) {
    if (actorRole !== 'customer') {
      return { allowed: false, error: 'Only the customer can cancel a pending booking request.' };
    }
  }

  return { allowed: true };
}

/**
 * Evaluates Settlement Eligibility based on booking completion and payment state
 */
export function evaluateSettlementState(booking, payment) {
  if (payment.status !== PAYMENT_STATES.SUCCESSFUL) {
    return SETTLEMENT_STATES.NOT_ELIGIBLE;
  }
  if (booking.status === BOOKING_STATES.DISPUTED) {
    return SETTLEMENT_STATES.ON_HOLD;
  }
  if (booking.customer_confirmed_at && booking.provider_confirmed_at && booking.status === BOOKING_STATES.COMPLETED) {
    return SETTLEMENT_STATES.ELIGIBLE;
  }
  if (booking.provider_confirmed_at && !booking.customer_confirmed_at) {
    return SETTLEMENT_STATES.AWAITING_COMPLETION_CONFIRMATION;
  }
  return SETTLEMENT_STATES.NOT_ELIGIBLE;
}

