import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function SupportView() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const ticketIdParam = routeParams.ticketId;

  const [activeTab, setActiveTab] = useState(
    window.location.pathname.includes('/new')
      ? 'new'
      : ticketIdParam
      ? 'ticket_details'
      : 'faqs'
  );

  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New ticket state
  const [newCategory, setNewCategory] = useState('booking');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ticket details state
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const loadSupportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [faqRes, tckRes] = await Promise.all([
        apiFetch('/api/support/faqs'),
        apiFetch('/api/support/tickets')
      ]);
      setFaqs(await faqRes.json());
      const tcks = await tckRes.json();
      setTickets(tcks);

      if (ticketIdParam) {
        const found = tcks.find((t) => t.id === ticketIdParam || t.reference === ticketIdParam);
        if (found) setActiveTicket(found);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupportData();
  }, [currentUser, ticketIdParam]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/support/tickets/new', {
        method: 'POST',
        body: JSON.stringify({
          category: newCategory,
          subject: newSubject,
          description: newDesc,
          booking_reference: bookingRef
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');
      showToast('Support ticket opened successfully!', 'success');
      setNewSubject('');
      setNewDesc('');
      setBookingRef('');
      setActiveTicket(data.ticket);
      setActiveTab('ticket_details');
      loadSupportData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    try {
      const res = await apiFetch(`/api/support/tickets/${activeTicket.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ text: replyText.trim() })
      });
      const data = await res.json();
      setActiveTicket(data.ticket);
      setReplyText('');
      showToast('Reply added to ticket thread', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingView message="Loading Help Centre and verified resolution desk..." />;
  if (error) return <ErrorView error={error} onRetry={loadSupportData} />;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Help Centre & Dispute Desk</h1>
          <p className="text-xs text-slate-500">
            Frequently asked questions, contract guidance, and active resolution tickets.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('new')}
          className="bg-forest text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-forest-700 transition shadow-xs self-start sm:self-auto"
        >
          + Open Support Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-1">
        {[
          { key: 'faqs', label: 'Platform FAQs & Guidance' },
          { key: 'tickets', label: `My Tickets (${tickets.length})` },
          { key: 'new', label: 'Create New Ticket' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === t.key
                ? 'border-forest text-forest font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: FAQS (Destination 31) */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                <span className="text-[10px] uppercase font-bold text-forest bg-forest-50 px-2 py-0.5 rounded-md">
                  {faq.category}
                </span>
                <h3 className="text-xs font-bold text-slate-900">{faq.question}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Have a specific farmland boundary or machinery issue?</h4>
              <p className="text-[11px] text-slate-600">Our resolution officers handle field verifications across all 36 states.</p>
            </div>
            <button
              onClick={() => setActiveTab('new')}
              className="bg-forest text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-forest-700 transition whitespace-nowrap ml-3"
            >
              Contact Desk →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MY TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <EmptyView
              icon="🎫"
              title="No support tickets opened"
              description="If you experience technical issues, payment queries, or booking disputes, create a ticket."
              actionLabel="Create Support Ticket"
              onAction={() => setActiveTab('new')}
            />
          ) : (
            tickets.map((tck) => (
              <div
                key={tck.id}
                onClick={() => {
                  setActiveTicket(tck);
                  setActiveTab('ticket_details');
                }}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:border-emerald-200 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{tck.reference}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-semibold uppercase">
                      {tck.category}
                    </span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.2 rounded">
                      {tck.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{tck.subject}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{tck.description}</p>
                </div>
                <span className="text-xs font-bold text-forest hover:underline">View Thread →</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: CREATE TICKET (Destination 32) */}
      {activeTab === 'new' && (
        <form onSubmit={handleCreateTicket} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Create New Support Request</h2>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Issue Category *</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            >
              <option value="booking">Booking / Schedule Coordination</option>
              <option value="payment">Bach Payment / Transaction Verification</option>
              <option value="verification">Land / Machinery Verification Inquiry</option>
              <option value="dispute">Quality / Defect Dispute</option>
              <option value="account">Account Access & Security</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject Line *</label>
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Inquiring about Zaria survey gazette verification"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Related Booking Reference (Optional)</label>
            <input
              type="text"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="e.g. BK-2026-8801"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Field Evidence *</label>
            <textarea
              rows={4}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Provide exact facts, locations, and details..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-forest hover:bg-forest-700 text-white text-xs font-bold px-7 py-3 rounded-full transition shadow-xs disabled:opacity-40"
          >
            {submitting ? 'Submitting Ticket...' : 'Submit Support Ticket ✓'}
          </button>
        </form>
      )}

      {/* TICKET DETAILS SUB-VIEW (Destination 33) */}
      {activeTab === 'ticket_details' && activeTicket && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400">Ticket: {activeTicket.reference}</span>
              <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">{activeTicket.subject}</h2>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-full uppercase">
              {activeTicket.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Conversation history */}
          <div className="space-y-3 py-2">
            {activeTicket.messages?.map((m, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                  m.sender === 'user' ? 'bg-forest-50/70 text-slate-800 ml-8' : 'bg-slate-50 text-slate-800 mr-8 border border-slate-200'
                }`}
              >
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>{m.sender === 'user' ? 'You' : 'TerraTills Resolution Team'}</span>
                  <span>{new Date(m.timestamp).toLocaleString()}</span>
                </div>
                <p className="leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <form onSubmit={handleReplyTicket} className="pt-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to support officer..."
              className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-full px-4 py-2.5"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="bg-forest text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-forest-700 disabled:opacity-40"
            >
              Send Reply
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

