import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function ReviewsView() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const newBookingIdParam = routeParams.bookingId;

  const [activeTab, setActiveTab] = useState('received'); // received, given, awaiting
  const [reviewsData, setReviewsData] = useState({ received: [], given: [], awaiting: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Write Review Modal
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState(newBookingIdParam || '');
  const [overallRating, setOverallRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/reviews');
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = await res.json();
      setReviewsData(data);

      if (newBookingIdParam) {
        setTargetBookingId(newBookingIdParam);
        setShowWriteModal(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentUser, newBookingIdParam]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please provide written feedback.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/reviews/new', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: targetBookingId,
          rating: overallRating,
          category_ratings: {
            quality: qualityRating,
            communication: communicationRating,
            timeliness: timelinessRating,
            reliability: 5
          },
          comment: reviewComment
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      showToast('Review recorded successfully! Thank you for strengthening marketplace trust.', 'success');
      setShowWriteModal(false);
      setReviewComment('');
      fetchReviews();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView message="Loading community trust ratings and verified reviews..." />;
  if (error) return <ErrorView error={error} onRetry={fetchReviews} />;

  const { received = [], given = [], awaiting = [] } = reviewsData;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Reviews & Reputation</h1>
        <p className="text-xs text-slate-500">
          Transparent peer evaluations from verified completed agricultural bookings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-1">
        {[
          { key: 'received', label: `Reviews Received (${received.length})` },
          { key: 'given', label: `Reviews I Left (${given.length})` },
          { key: 'awaiting', label: `Awaiting My Review (${awaiting.length})` }
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

      {/* TAB 1: RECEIVED */}
      {activeTab === 'received' && (
        <div className="space-y-3">
          {received.length === 0 ? (
            <EmptyView
              icon="★"
              title="No reviews received yet"
              description="Complete service bookings to build your public agricultural reputation score."
            />
          ) : (
            received.map((rev) => (
              <div key={rev.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={rev.reviewer_avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.reviewer_name}</h4>
                      <span className="text-[10px] text-slate-400">Verified Client • Booking: {rev.booking_id}</span>
                    </div>
                  </div>
                  <div className="text-amber-500 font-bold text-sm">{'★'.repeat(rev.rating)}</div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                {rev.provider_response && (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-950">
                    <span className="font-bold block text-forest">Your Response:</span>
                    {rev.provider_response}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: GIVEN */}
      {activeTab === 'given' && (
        <div className="space-y-3">
          {given.length === 0 ? (
            <EmptyView icon="✍️" title="No reviews written yet" description="Reviews you submit will be displayed here." />
          ) : (
            given.map((rev) => (
              <div key={rev.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900">Booking: {rev.booking_id}</span>
                  <div className="text-amber-500 text-xs">{'★'.repeat(rev.rating)}</div>
                </div>
                <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: AWAITING MY REVIEW */}
      {activeTab === 'awaiting' && (
        <div className="space-y-3">
          {awaiting.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-xs text-slate-500">
              ✓ All your completed bookings have been reviewed!
            </div>
          ) : (
            awaiting.map((b) => (
              <div key={b.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{b.listing_title}</span>
                  <span className="text-[10px] text-slate-400">Reference: {b.reference} • Completed</span>
                </div>
                <button
                  onClick={() => {
                    setTargetBookingId(b.id);
                    setShowWriteModal(true);
                  }}
                  className="bg-forest text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-forest-700 transition"
                >
                  Write Review ★
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Write Review Modal (Destination 28) */}
      <Modal
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        title="Leave Verified Agricultural Review"
        footer={
          <>
            <button
              onClick={() => setShowWriteModal(false)}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={submitting || !reviewComment.trim()}
              className="px-6 py-2 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-700 transition"
            >
              {submitting ? 'Submitting...' : 'Post Review ✓'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Overall Star Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  className={`text-2xl transition ${
                    star <= overallRating ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Service Quality</span>
              <select
                value={qualityRating}
                onChange={(e) => setQualityRating(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Communication</span>
              <select
                value={communicationRating}
                onChange={(e) => setCommunicationRating(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Timeliness</span>
              <select
                value={timelinessRating}
                onChange={(e) => setTimelinessRating(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Written Feedback *</label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Detail your experience with machinery operation, soil moisture, worker speed, or tutorial guidance..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-forest"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

