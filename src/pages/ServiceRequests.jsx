import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function ServiceRequests() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const requestIdParam = routeParams.requestId;

  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail / Response Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseAction, setResponseAction] = useState('accept'); // 'accept' | 'decline' | 'revise'
  const [responseMessage, setResponseMessage] = useState('');
  const [revisedAmount, setRevisedAmount] = useState('');
  const [responding, setResponding] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/service-requests');
      if (!res.ok) throw new Error('Failed to load incoming service requests');
      const data = await res.json();
      setRequests(data.requests || []);
      setCounts(data.counts || {});

      // If URL has :requestId, preselect it
      if (requestIdParam) {
        const target = data.requests.find((r) => r.id === requestIdParam || r.reference === requestIdParam);
        if (target) {
          setSelectedRequest(target);
          setShowResponseModal(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser, requestIdParam]);

  const handleOpenResponse = (reqItem, action) => {
    setSelectedRequest(reqItem);
    setResponseAction(action);
    setRevisedAmount(reqItem.proposed_amount);
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setResponding(true);
    try {
      const res = await apiFetch(`/api/service-requests/${selectedRequest.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({
          action: responseAction,
          message: responseMessage,
          revised_amount: responseAction === 'revise' ? Number(revisedAmount) : undefined
        })
      });
      if (!res.ok) throw new Error('Failed to process response');
      showToast(
        responseAction === 'accept'
          ? 'Request accepted! Terms recorded. Customer notified to pay.'
          : responseAction === 'decline'
          ? 'Request declined.'
          : 'Revised terms proposal sent to customer.',
        'success'
      );
      setShowResponseModal(false);
      fetchRequests();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setResponding(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (activeTab === 'pending') return r.status === 'pending_provider_response';
    if (activeTab === 'accepted') return r.status === 'accepted';
    if (activeTab === 'declined') return r.status === 'declined';
    return true;
  });

  return (
    <div className="space-y-6 pb-16 px-4 md:px-6 pt-4">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Incoming Service Requests</h1>
        <p className="text-xs text-slate-500">
          Customers requesting your tractors, farmland parcels, labour teams, or masterclasses.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-1">
        {[
          { key: 'all', label: 'All Requests', count: counts.all || 0 },
          { key: 'pending', label: 'Pending Response', count: counts.pending || 0 },
          { key: 'accepted', label: 'Accepted', count: counts.accepted || 0 },
          { key: 'declined', label: 'Declined', count: counts.declined || 0 }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === t.key
                ? 'border-forest text-forest font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{t.label}</span>
            <span className="text-[10px] bg-slate-100 px-1.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <LoadingView message="Loading your incoming service requests..." />
      ) : error ? (
        <ErrorView error={error} onRetry={fetchRequests} />
      ) : filtered.length === 0 ? (
        <EmptyView
          icon="📬"
          title="No service requests found"
          description="When clients request your listed agricultural services, they will appear here for review."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-card transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <img
                  src={req.customer_avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200'}
                  alt={req.customer_name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[11px] font-extrabold text-slate-900">{req.reference}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                      req.status === 'pending_provider_response'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : req.status === 'accepted'
                        ? 'bg-emerald-100 text-forest'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {req.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{req.listing_title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    From <span className="font-semibold text-slate-800">{req.customer_name}</span> • Requested: <span className="font-semibold">{req.requested_dates?.start} ({req.requested_dates?.duration_days || 1} Days)</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 italic bg-slate-50 p-2 rounded-xl">
                    "{req.proposed_scope}"
                  </p>
                </div>
              </div>

              {/* Proposed Price & Action Buttons */}
              <div className="flex items-center md:flex-col md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-left md:text-right mb-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Proposed Amount</span>
                  <span className="text-base font-extrabold text-forest">
                    ₦{req.proposed_amount.toLocaleString()}
                  </span>
                </div>

                {req.status === 'pending_provider_response' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenResponse(req, 'accept')}
                      className="bg-forest hover:bg-forest-700 text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-xs"
                    >
                      Accept Terms ✓
                    </button>
                    <button
                      onClick={() => handleOpenResponse(req, 'revise')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-full transition"
                    >
                      Propose Revision
                    </button>
                    <button
                      onClick={() => handleOpenResponse(req, 'decline')}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-2 rounded-full transition"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/dashboard/bookings`)}
                    className="text-xs font-bold text-forest hover:underline"
                  >
                    View in Bookings →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title={
          responseAction === 'accept'
            ? 'Accept Booking Request'
            : responseAction === 'decline'
            ? 'Decline Booking Request'
            : 'Propose Revised Scope / Price'
        }
        footer={
          <>
            <button
              onClick={() => setShowResponseModal(false)}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitResponse}
              disabled={responding}
              className={`px-6 py-2 rounded-full text-white text-xs font-bold transition ${
                responseAction === 'accept'
                  ? 'bg-forest hover:bg-forest-700'
                  : responseAction === 'decline'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {responding ? 'Processing...' : `Confirm ${responseAction.toUpperCase()}`}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitResponse} className="space-y-4 text-xs">
          {selectedRequest && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p><strong>Customer:</strong> {selectedRequest.customer_name}</p>
              <p><strong>Listing:</strong> {selectedRequest.listing_title}</p>
              <p><strong>Proposed Amount:</strong> ₦{selectedRequest.proposed_amount.toLocaleString()}</p>
            </div>
          )}

          {responseAction === 'accept' && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950">
              <p className="font-bold">Non-Negotiable Product Rule 8:</p>
              <p className="mt-1 text-[11px] text-emerald-900 leading-relaxed">
                Accepting confirms that you agree to the requested dates and scope. The customer will be prompted to review your finalized agreement and pay into Secured Platform Holding via Bach.
              </p>
            </div>
          )}

          {responseAction === 'revise' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposed Counter Price (₦)</label>
              <input
                type="number"
                value={revisedAmount}
                onChange={(e) => setRevisedAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                required
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Notes / Message to Customer
            </label>
            <textarea
              rows={3}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="e.g. Terms accepted. Tractor will arrive by 8:00 AM on scheduled start date."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

