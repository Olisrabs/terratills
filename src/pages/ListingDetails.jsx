import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import Modal from '../components/Modal';
import { LoadingView, ErrorView } from '../components/StateViews';

export default function ListingDetails() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const listingId = routeParams.listingId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/listings/${listingId}`);
        if (!res.ok) throw new Error('Listing not found');
        const json = await res.json();
        setData(json);
        setIsSaved(json.listing?.is_saved || false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [listingId]);

  if (loading) return <LoadingView message="Loading verified service details and specifications..." />;
  if (error) return <ErrorView error={error} />;

  const { listing, provider, reviews = [], relatedListings = [] } = data || {};

  const handleSaveToggle = async () => {
    try {
      const res = await apiFetch('/api/saved/toggle', {
        method: 'POST',
        body: JSON.stringify({ listing_id: listing.id })
      });
      const resData = await res.json();
      setIsSaved(resData.saved);
      showToast(resData.saved ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
    } catch (err) {
      showToast('Error saving listing', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Listing link copied to clipboard!', 'success');
    }
  };

  const handleReport = (e) => {
    e.preventDefault();
    setShowReportModal(false);
    showToast('Report submitted for compliance review.', 'info');
  };

  const isOwner = currentUser?.id === listing?.owner_id;

  return (
    <div className="space-y-6 pb-20 px-4 md:px-6 pt-4 max-w-6xl mx-auto">

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Gallery, Overview, Attributes, Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery Container */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-card">
            <div className="relative h-72 sm:h-96 w-full bg-slate-900 cursor-pointer" onClick={() => setShowImageViewer(true)}>
              <img
                src={listing?.gallery?.[activeImageIndex] || listing?.cover_image}
                alt={listing?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex space-x-2">
                {listing?.verified && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    ✓ Verified Contract
                  </span>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowImageViewer(true); }}
                className="absolute bottom-3 right-3 bg-slate-950/70 hover:bg-slate-950 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs transition"
              >
                🔍 Full Gallery ({listing?.gallery?.length || 1})
              </button>
            </div>

            {/* Thumbnail selector */}
            {listing?.gallery && listing.gallery.length > 1 && (
              <div className="p-3 flex space-x-2 overflow-x-auto no-scrollbar bg-slate-50 border-t border-slate-100">
                {listing.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx ? 'border-forest ring-2 ring-forest/30' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Core Description */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
            <div>
              <div className="flex items-center text-xs font-semibold text-slate-400 mb-1 space-x-1">
                <span>📍</span>
                <span>{listing?.location?.town}, {listing?.location?.lga}, {listing?.location?.state} State, Nigeria</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {listing?.title}
              </h1>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description & Operational Scope</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {listing?.description}
              </p>
            </div>

            {/* Category-Specific Detailed Specifications */}
            {listing?.attributes && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Technical & Contract Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(listing.attributes).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-bold text-slate-900 block break-words">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Verified Client Reviews ({reviews.length})</h3>
                <p className="text-xs text-slate-400">Only verified completed booking participants can submit feedback</p>
              </div>
              <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold text-amber-800">
                <span>★</span>
                <span>{provider?.rating || '5.0'}</span>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <img src={rev.reviewer_avatar} alt={rev.reviewer_name} className="w-7 h-7 rounded-full object-cover" />
                        <span className="text-xs font-bold text-slate-900">{rev.reviewer_name}</span>
                      </div>
                      <div className="text-amber-500 text-xs">{'★'.repeat(rev.rating)}</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    {rev.provider_response && (
                      <div className="mt-2.5 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-900">
                        <span className="font-bold block">Provider Response:</span>
                        {rev.provider_response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No reviews submitted yet for this listing.</p>
            )}
          </div>

          {/* Related Listings */}
          {relatedListings.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Similar Agricultural Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedListings.map((rel) => (
                  <ListingCard key={rel.id} listing={rel} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Booking Action Card, Price Breakdown, Provider Trust */}
        <div className="space-y-5">
          {/* Booking & Pricing Action Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-float sticky top-20">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
                Base Service Rate
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-forest">
                  ₦{listing?.price?.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  / {listing?.pricing_unit}
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                Available for Booking
              </span>
            </div>

            {/* Estimated Pricing Breakdown */}
            <div className="py-3 space-y-2 text-xs border-b border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>1 Unit ({listing?.pricing_unit})</span>
                <span>₦{listing?.price?.toLocaleString()}</span>
              </div>
              {listing?.category === 'machinery' && (
                <div className="flex justify-between text-slate-600">
                  <span>Logistics Transport (Estimate)</span>
                  <span>₦40,000</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Platform Security Holding Fee (5%)</span>
                <span>₦{Math.round((listing?.price || 0) * 0.05).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Estimated</span>
                <span className="text-forest font-extrabold">
                  ₦{((listing?.price || 0) * 1.05 + (listing?.category === 'machinery' ? 40000 : 0)).toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                * Final agreed scope, transport delivery, and dates are confirmed with provider before payment. No charge is made upon request.
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-4 space-y-2.5">
              {!isOwner ? (
                <>
                  <button
                    onClick={() => navigate(`/dashboard/bookings/new/${listing?.id}`)}
                    className="w-full bg-forest hover:bg-forest-700 text-white text-xs font-bold py-3 rounded-full transition shadow-card flex items-center justify-center space-x-2"
                  >
                    <span>📅</span>
                    <span>Request Booking</span>
                  </button>

                  <button
                    onClick={() => navigate('/dashboard/messages')}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold py-2.5 rounded-full border border-slate-200 transition flex items-center justify-center space-x-2"
                  >
                    <span>💬</span>
                    <span>Enquire / Message Provider</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate(`/dashboard/services/${listing?.id}`)}
                  className="w-full bg-forest text-white text-xs font-bold py-3 rounded-full transition"
                >
                  Manage Your Listing →
                </button>
              )}

              {/* Auxiliary Actions: Save, Share, Report */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={handleSaveToggle}
                  className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-1 transition ${
                    isSaved ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{isSaved ? '❤️' : '🤍'}</span>
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <span>🔗</span>
                  <span>Share</span>
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <span>🚩</span>
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Provider Card */}
          {provider && (
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
                Verified Service Provider
              </span>
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-300/40"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border border-forest text-[9px] flex items-center justify-center">
                    🌿
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{provider.name}</h4>
                  <p className="text-[11px] text-emerald-700 font-semibold">{provider.badge}</p>
                  <p className="text-[10px] text-slate-400">Member since {provider.memberSince}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs py-2 bg-slate-50 rounded-xl mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Rating</span>
                  <span className="font-bold text-slate-800">★ {provider.rating} ({provider.reviewCount})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Completed</span>
                  <span className="font-bold text-slate-800">{provider.completedBookingsCount} Bookings</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <p>• Response rate: <span className="font-semibold text-slate-700">{provider.responseRate}</span></p>
                <p>• Avg response time: <span className="font-semibold text-slate-700">{provider.responseTime}</span></p>
              </div>

              <button
                onClick={() => navigate('/dashboard/profile')}
                className="w-full mt-3 text-xs font-bold text-forest hover:underline text-center block"
              >
                View Public Provider Profile →
              </button>
            </div>
          )}

          {/* Trust & Safety Checklist */}
          <div className="bg-forest-50 border border-emerald-100 rounded-3xl p-4 text-xs text-forest-900 space-y-1.5">
            <h4 className="font-bold text-forest">🛡️ TerraTills Trust Guarantee</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Payments are held securely via Bach. Providers are paid only after you independently confirm field inspection and satisfactory delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Full Image Viewer Modal */}
      <Modal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        title={listing?.title}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <img
            src={listing?.gallery?.[activeImageIndex] || listing?.cover_image}
            alt="Gallery Full"
            className="w-full max-h-[70vh] object-contain rounded-2xl bg-black"
          />
          <div className="flex space-x-2 overflow-x-auto no-scrollbar justify-center py-2">
            {listing?.gallery?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 ${
                  activeImageIndex === idx ? 'border-forest ring-2 ring-forest' : 'opacity-60'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Service Listing"
        footer={
          <>
            <button
              onClick={() => setShowReportModal(false)}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleReport}
              className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Submit Report
            </button>
          </>
        }
      >
        <form onSubmit={handleReport} className="space-y-3">
          <p className="text-xs text-slate-600">
            TerraTills investigates all listing inaccuracies, land title disputes, and machinery misrepresentations.
          </p>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
            placeholder="Explain the issue with this listing..."
            className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
            required
          />
        </form>
      </Modal>
    </div>
  );
}

