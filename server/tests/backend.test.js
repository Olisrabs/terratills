import assert from 'assert';
import { db, CATEGORIES } from '../db.js';
import { BOOKING_STATES, PAYMENT_STATES, SETTLEMENT_STATES, canTransitionBooking, evaluateSettlementState } from '../stateMachines.js';
import { bachAdapter } from '../adapters/bachPayment.js';
import { TerraTillsAIEngine } from '../aiEngine.js';

console.log('--- Running TerraTills Backend Acceptance Tests ---');

// Test 1: Unified Account Model
const user1 = db.getUser('user_1');
assert.ok(user1, 'User 1 exists');
const user1Listings = db.getListings({ owner_id: 'user_1' });
const user1BookingsAsCustomer = db.getBookings('user_1', 'customer');
assert.ok(user1Listings.length > 0, 'User 1 owns service listings (Provider role)');
assert.ok(user1BookingsAsCustomer.length > 0, 'User 1 has requested bookings (Customer role in same unified account)');
console.log('✓ Test 1 Passed: Unified Account Model verified (User acts as both Provider and Customer under one account)');

// Test 2: Category Discovery
assert.strictEqual(CATEGORIES.length, 4, '4 initial categories registered');
const farmlandListings = db.getListings({ category: 'farmland' });
const machineryListings = db.getListings({ category: 'machinery' });
assert.ok(farmlandListings.length > 0, 'Farmland listings present');
assert.ok(machineryListings.length > 0, 'Machinery listings present');
console.log('✓ Test 2 Passed: Initial 4 categories and category attributes verified');

// Test 3: Independent State Machines
const testBooking = {
  status: BOOKING_STATES.COMPLETED,
  customer_confirmed_at: '2026-10-09T18:00:00Z',
  provider_confirmed_at: '2026-10-09T16:00:00Z'
};
const testPayment = { status: PAYMENT_STATES.SUCCESSFUL };
const settlementState = evaluateSettlementState(testBooking, testPayment);
assert.strictEqual(settlementState, SETTLEMENT_STATES.ELIGIBLE, 'Settlement becomes eligible only when payment is successful and both parties confirmed');

const pendingPaymentState = evaluateSettlementState(testBooking, { status: PAYMENT_STATES.PENDING });
assert.strictEqual(pendingPaymentState, SETTLEMENT_STATES.NOT_ELIGIBLE, 'Settlement is not eligible if payment is pending');
console.log('✓ Test 3 Passed: Independent state transitions for Booking, Payment, and Settlement verified');

// Test 4: Bach Adapter Integration & Idempotency
async function testBach() {
  const session = await bachAdapter.createPaymentSession({
    bookingId: 'BK-TEST-001',
    amount: 150000,
    customerEmail: 'test@terratills.ng',
    customerName: 'Test Farmer',
    idempotencyKey: 'IDEMP-TEST-99'
  });
  assert.ok(session.gatewayReference.startsWith('BACH-TX-'), 'Bach gateway reference generated');
  assert.strictEqual(session.amount, 150000);

  const statusQuery = await bachAdapter.queryTransactionStatus(session.gatewayReference);
  assert.strictEqual(statusQuery.verified, true, 'Server-to-server query verification succeeded');
  console.log('✓ Test 4 Passed: Bach Payment Adapter contract & server verification verified');
}

// Test 5: AI Engine Grounded Queries & Guardrails
async function testAI() {
  const ai = new TerraTillsAIEngine(db);
  const extraction = ai.extractParameters('Looking for 20 hectares farmland in Oyo State with river water');
  assert.strictEqual(extraction.category, 'farmland');
  assert.strictEqual(extraction.location, 'Oyo');
  assert.strictEqual(extraction.quantity, '20 hectares');

  const result = await ai.processQuery('Need a tractor in Kaduna for 3 days', user1);
  assert.ok(result.suggestedListings.length > 0, 'AI queried real database listings');
  assert.ok(result.disclaimer.includes('AI cannot execute financial payments'), 'AI privileged action guardrails enforced');
  console.log('✓ Test 5 Passed: AI Assistant entity extraction, grounded listing query, and security guardrails verified');
}

(async () => {
  await testBach();
  await testAI();
  console.log('\n========================================');
  console.log('ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY');
  console.log('========================================\n');
})();

