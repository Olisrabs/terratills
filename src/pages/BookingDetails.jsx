import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { LoadingView, ErrorView, PermissionDeniedView } from '../components/StateViews';

export default function BookingDetails() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const bookingId = routeParams.bookingId;

  const [booking, setBooking] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  // Active section tab: 'details' | 'completion' | 'messages'
  const [activeSection, setActiveSection] = useState(
    window.location.pathname.includes('/completion')
      ? 'completion'
      : window.location.pathname.includes('/messages')
      ? 'messages'
      : 'details'
  );

  // Actions state
  const [paying, setPaying] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Message chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const loadBooking = async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const res = await apiFetch(`/api/bookings/${bookingId}`);
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) throw new Error('Booking not found');
      const data = await res.json();
      setBooking(data.booking);
      setUserRole(data.userRole);
      setCustomer(data.customer);
      setProvider(data.provider);

      // Load linked messages
      if (data.conversationId) {
        const msgRes = await apiFetch(`/api/messages/${data.conversationId}`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setChatMessages(msgData.messages || []);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId, currentUser]);

  if (loading) return <LoadingView message="Loading authoritative booking contract..." />;
  if (forbidden) return <PermissionDeniedView reason="Only authorized participants (Customer or Provider) can access this booking record." />;
  if (error) return <ErrorView error={error} onRetry={loadBooking} />;
  if (!booking) return null;

  const isCustomer = userRole === 'customer';
  const isProvider = userRole === 'provider';

  // 1. Payment Initialization with Bach (Non-negotiable Rule 12)
  const handleInitiatePayment = async () => {
    setPaying(true);
    try {
      const res = await apiFetch(`/api/bookings/${booking.id}/pay`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize Bach payment session');
      setPaymentSession(data.paymentSession);
      setShowPayModal(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPaying(false);
    }
  };

  // 2. Authoritative Server-side Verification of Payment (Rule 9)
  const handleConfirmBachPayment = async () => {
    setActionInProgress(true);
    try {
      const res = await apiFetch(`/api/bookings/${booking.id}/verify-payment`, {
        method: 'POST',
        body: JSON.stringify({ gatewayReference: paymentSession.gatewayReference })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server verification failed');
      setBooking(data.booking);
      setShowPayModal(false);
      showToast('Payment confirmed and secured in platform holding!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  // 3. Independent Completion Confirmation (Non-negotiable Rule 11 of spec)
  const handleCompletionAction = async (actionType) => {
    setActionInProgress(true);
    try {
      const notes = actionType === 'dispute' ? disputeNotes : completionNotes;
      const res = await apiFetch(`/api/bookings/${booking.id}/completion`, {
        method: 'POST',
        body: JSON.stringify({ action: actionType, notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit confirmation');
      setBooking(data.booking);
      if (actionType === 'dispute') setShowDisputeModal(false);
      showToast(
        actionType === 'customer_confirm'
          ? 'Customer confirmation recorded! Settlement unlocked.'
          : actionType === 'provider_confirm'
          ? 'Delivery recorded! Awaiting customer confirmation.'
          : 'Dispute recorded and settlement put on hold.',
        'info'
      );
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  // 4. Send Linked Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    setSendingMsg(true);
    try {
      // Find or create conversation
      const convRes = await apiFetch(`/api/messages`);
      const convs = await convRes.json();
      let conv = convs.find((c) => c.booking_id === booking.id);
      if (!conv) {
        showToast('Direct communication line active.', 'info');
      } else {
        const sendRes = await apiFetch(`/api/messages/${conv.id}/send`, {
          method: 'POST',
          body: JSON.stringify({ text: newMessageText })
        });
        const sendData = await sendRes.json();
        setChatMessages((prev) => [...prev, sendData.message]);
        setNewMessageText('');
      }
    } catch (err) {
      showToast('Could not send message', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Reference:</span>
            <span className="text-sm font-extrabold text-slate-900">{booking.reference}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isCustomer ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {isCustomer ? 'You are Customer' : 'You are Service Provider'}
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-900 mt-1">{booking.listing_title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge type="booking" status={booking.status} />
          <StatusBadge type="payment" status={booking.payment_status} />
          <StatusBadge type="settlement" status={booking.settlement_status} />
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSection('details')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSection === 'details' ? 'border-forest text-forest' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Contract Details & Timeline
        </button>
        <button
          onClick={() => setActiveSection('completion')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
            activeSection === 'completion' ? 'border-forest text-forest' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Completion & Settlement</span>
          {booking.status === 'awaiting_completion_confirmation' && (
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveSection('messages')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeSection === 'messages' ? 'border-forest text-forest' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Communication & Messages
        </button>
      </div>

      {/* SECTION 1: CONTRACT DETAILS */}
      {activeSection === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Agreed Snapshot, Financial Breakdown, Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Callout based on Booking Status */}
            {booking.status === 'awaiting_payment' && isCustomer && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-forest font-extrabold text-sm">
                  <span>✓</span>
                  <span>Provider Accepted Your Request! Payment is Now Due.</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Engr. Adesola reviewed and accepted your terms. Funds will be held securely in platform holding via <strong>Bach Payment Gateway</strong> and released to provider only after your independent delivery confirmation.
                </p>
                <button
                  onClick={handleInitiatePayment}
                  disabled={paying}
                  className="bg-forest hover:bg-forest-700 text-white text-xs font-bold px-6 py-2.5 rounded-full transition shadow-xs flex items-center space-x-2"
                >
                  <span>💳</span>
                  <span>{paying ? 'Connecting to Bach Gateway...' : `Review & Pay ₦${booking.amount_breakdown?.total_amount?.toLocaleString()}`}</span>
                </button>
              </div>
            )}

            {/* Listing Snapshot (Immutable historical terms) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Agreed Contract Snapshot (Immutable Record)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Category</span>
                  <span className="text-xs font-bold text-slate-900 capitalize">{booking.category}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Scheduled Dates</span>
                  <span className="text-xs font-bold text-slate-900">
                    {booking.scheduled_dates?.start} to {booking.scheduled_dates?.end}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Location</span>
                  <span className="text-xs font-bold text-slate-900">
                    {booking.service_location?.town}, {booking.service_location?.state} State
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Quantity / Scope</span>
                  <span className="text-xs font-bold text-slate-900">
                    {booking.listing_snapshot?.quantity || 1} {booking.listing_snapshot?.pricing_unit || 'Units'}
                  </span>
                </div>
              </div>

              {booking.terms_agreed && (
                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs">
                  <span className="font-bold text-forest block mb-1">Agreed Scope Statement:</span>
                  <p className="text-slate-700">{booking.terms_agreed.agreed_scope}</p>
                </div>
              )}
            </div>

            {/* Financial Ledger & Payment Allocation */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-3 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Financial Breakdown & Payment Allocation
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Agreed Base Amount</span>
                  <span className="font-bold text-slate-800">
                    ₦{booking.amount_breakdown?.base_amount?.toLocaleString()}
                  </span>
                </div>
                {booking.amount_breakdown?.logistics_fee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Logistics / Transport Fee</span>
                    <span className="font-bold text-slate-800">
                      ₦{booking.amount_breakdown?.logistics_fee?.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Platform Protected Holding Fee (5%)</span>
                  <span className="font-bold text-slate-800">
                    ₦{booking.amount_breakdown?.platform_fee?.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-forest text-base">
                    ₦{booking.amount_breakdown?.total_amount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {booking.payment_details && (
                <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl space-y-1">
                  <p className="text-[11px] font-bold text-emerald-800">✓ Verified Bach Transaction Record:</p>
                  <p className="text-[10px] text-slate-500">Gateway Ref: {booking.payment_details.gateway_reference}</p>
                  <p className="text-[10px] text-slate-500">Method: {booking.payment_details.method}</p>
                  <p className="text-[10px] text-slate-500">Paid At: {new Date(booking.payment_details.paid_at).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Timeline of Status Events */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Authoritative Contract Timeline
              </h3>
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {booking.timeline?.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center text-[8px] font-bold">
                      ✓
                    </span>
                    <p className="text-xs font-bold text-slate-900 capitalize">
                      {step.step.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{step.note}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(step.timestamp).toLocaleString()} ({step.actor})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Participants & Next Actions */}
          <div className="space-y-5">
            {/* Participants Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Booking Participants
              </h3>

              {/* Customer */}
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <img
                  src={customer?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                  alt="Customer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-md">
                    Customer
                  </span>
                  <p className="text-xs font-bold text-slate-900">{customer?.name || booking.customer_name}</p>
                  <p className="text-[11px] text-slate-500">{customer?.phone || booking.customer_contact}</p>
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-center space-x-3">
                <img
                  src={provider?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'}
                  alt="Provider"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md">
                    Service Provider
                  </span>
                  <p className="text-xs font-bold text-slate-900">{provider?.name || booking.provider_name}</p>
                  <p className="text-[11px] text-slate-500">{provider?.phone || '+234 802 334 9911'}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveSection('messages')}
                className="w-full mt-2 bg-slate-50 hover:bg-slate-100 text-forest text-xs font-bold py-2 rounded-xl border border-slate-200 transition text-center block"
              >
                Open Booking Messages →
              </button>
            </div>

            {/* Quick Dispute / Support Help */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200/70 space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Facing a conflict?</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If the service scope or land boundaries do not match specifications, file a dispute before confirming completion.
              </p>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="text-xs font-bold text-rose-600 hover:underline block"
              >
                Report Issue / Dispute Contract →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: COMPLETION & SETTLEMENT CONFIRMATION (Destination 11) */}
      {activeSection === 'completion' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-6">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Independent Service Completion Confirmation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              In accordance with Non-Negotiable Rule 11 of the specification, provider and customer confirm completion independently. Neither participant can confirm for the other.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Column */}
            <div className={`p-5 rounded-2xl border ${
              booking.provider_confirmed_at ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900">1. Service Provider Confirmation</span>
                {booking.provider_confirmed_at ? (
                  <span className="bg-forest text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ✓ Confirmed Delivered
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Pending Provider
                  </span>
                )}
              </div>

              {booking.provider_confirmed_at ? (
                <div className="text-xs space-y-1">
                  <p className="text-emerald-900 font-semibold">Recorded by Provider:</p>
                  <p className="text-slate-600 italic">"{booking.provider_completion_notes || 'Service delivered as agreed'}"</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Confirmed on: {new Date(booking.provider_confirmed_at).toLocaleString()}
                  </p>
                </div>
              ) : isProvider ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    As the provider, once you finish field harrowing, harvesting, or teaching the tutorial, record your completion declaration.
                  </p>
                  <textarea
                    rows={3}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Enter completion notes, harvest weight, or handover details..."
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5"
                  />
                  <button
                    onClick={() => handleCompletionAction('provider_confirm')}
                    disabled={actionInProgress}
                    className="w-full bg-forest text-white text-xs font-bold py-2.5 rounded-xl hover:bg-forest-700 transition"
                  >
                    Mark Service Delivered →
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">
                  Waiting for provider <span className="font-semibold text-slate-800">{booking.provider_name}</span> to mark delivery.
                </p>
              )}
            </div>

            {/* Customer Column */}
            <div className={`p-5 rounded-2xl border ${
              booking.customer_confirmed_at ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900">2. Customer Satisfaction Confirmation</span>
                {booking.customer_confirmed_at ? (
                  <span className="bg-forest text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ✓ Confirmed Satisfactory
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Pending Customer
                  </span>
                )}
              </div>

              {booking.customer_confirmed_at ? (
                <div className="text-xs space-y-1">
                  <p className="text-emerald-900 font-semibold">Recorded by Customer:</p>
                  <p className="text-slate-600 italic">"{booking.customer_completion_notes || 'Confirmed satisfactory'}"</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Confirmed on: {new Date(booking.customer_confirmed_at).toLocaleString()}
                  </p>
                </div>
              ) : isCustomer ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Inspect the farmland boundaries, machinery hours, or labour output. Only confirm when satisfied.
                  </p>
                  <textarea
                    rows={3}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Provide inspection feedback..."
                    className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCompletionAction('customer_confirm')}
                      disabled={actionInProgress}
                      className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition"
                    >
                      Confirm Satisfactory Delivery ✓
                    </button>
                    <button
                      onClick={() => setShowDisputeModal(true)}
                      className="px-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 hover:bg-rose-100"
                    >
                      Report Issue
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">
                  Waiting for customer <span className="font-semibold text-slate-800">{booking.customer_name}</span> to complete field inspection.
                </p>
              )}
            </div>
          </div>

          {/* Settlement Status Banner */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Settlement State</span>
              <span className="text-xs font-extrabold text-slate-900 capitalize">
                {booking.settlement_status?.replace(/_/g, ' ')}
              </span>
            </div>
            {booking.status === 'completed' && (
              <button
                onClick={() => navigate(`/dashboard/reviews/new/${booking.id}`)}
                className="bg-forest text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-forest-700 transition"
              >
                Write a Review ★
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: MESSAGES (Destination 10) */}
      {activeSection === 'messages' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Booking Direct Communication</h3>
              <p className="text-xs text-slate-400">All conversation messages are encrypted and associated with this contract</p>
            </div>
          </div>

          {/* Messages list */}
          <div className="h-64 overflow-y-auto no-scrollbar space-y-3 p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
            {chatMessages.length > 0 ? (
              chatMessages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      
                    <div className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs ${
                      isMe ? 'bg-forest text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-[9px] block text-right mt-1 ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-12 text-center">
                No messages yet. Send a message to coordinate logistics, tractor arrival, or boundary inspection.
              </p>
            )}
          </div>

          {/* Message composer */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Type message regarding this booking..."
              className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-full px-4 py-2.5 focus:ring-2 focus:ring-forest"
            />
            <button
              type="submit"
              disabled={sendingMsg || !newMessageText.trim()}
              className="bg-forest hover:bg-forest-700 disabled:opacity-40 text-white text-xs font-bold px-5 py-2.5 rounded-full transition"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Bach Payment Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Bach Secured Payment Gateway"
        footer={
          <>
            <button
              onClick={() => setShowPayModal(false)}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBachPayment}
              disabled={actionInProgress}
              className="px-6 py-2 rounded-full bg-forest hover:bg-forest-700 text-white text-xs font-bold"
            >
              {actionInProgress ? 'Verifying with Bach Server...' : 'Confirm Server-Side Verification'}
            </button>
          </>
        }
      >
        {paymentSession && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Bach Gateway Session Initialized
              </span>
              <p className="text-base font-extrabold text-forest mt-0.5">
                ₦{paymentSession.amount.toLocaleString()} NGN
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Reference: <code className="font-mono bg-white px-1.5 py-0.5 rounded text-slate-800">{paymentSession.gatewayReference}</code>
              </p>
            </div>

            <div className="space-y-2 text-slate-600">
              <p>• <strong>Provider Adapter:</strong> Bach Payment Gateway (Nigeria NIP & Virtual Account)</p>
              <p>• <strong>Platform Holding:</strong> Funds are held securely on TerraTills until dual confirmation is signed.</p>
              <p>• <strong>Idempotency Key:</strong> <span className="font-mono text-[10px]">{paymentSession.idempotencyKey}</span></p>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Non-Negotiable Rule 9 compliance: Server-side API query verification is executed. A client redirect is never accepted as proof of payment.
            </p>
          </div>
        )}
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Open Contract Dispute"
        footer={
          <>
            <button
              onClick={() => setShowDisputeModal(false)}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => handleCompletionAction('dispute')}
              disabled={actionInProgress}
              className="px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              Submit Formal Dispute
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Opening a dispute halts settlement and flags the contract for inspection by TerraTills field resolution officers. Please provide specific details:
          </p>
          <textarea
            rows={4}
            value={disputeNotes}
            onChange={(e) => setDisputeNotes(e.target.value)}
            placeholder="Describe the defect, acreage discrepancy, or machinery breakdown..."
            className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
            required
          />
        </div>
      </Modal>
    </div>
  );
}

