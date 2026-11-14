import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LoadingView, ErrorView } from '../components/StateViews';

export default function BookingRequest() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const listingId = routeParams.listingId;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0]);
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [serviceLocation, setServiceLocation] = useState({
    state: currentUser?.location?.state || 'Kaduna',
    lga: currentUser?.location?.lga || 'Zaria',
    town: currentUser?.location?.town || 'Zaria',
    details: ''
  });
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [categoryRequirements, setCategoryRequirements] = useState({});
  const [termsConsent, setTermsConsent] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/listings/${listingId}`);
        if (!res.ok) throw new Error('Listing not found');
        const data = await res.json();
        setListing(data.listing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [listingId]);

  if (loading) return <LoadingView message="Initializing category-aware booking request form..." />;
  if (error) return <ErrorView error={error} />;

  const basePrice = (listing?.price || 0) * (Number(quantity) || 1);
  const logisticsFee = listing?.category === 'machinery' ? 40000 : 0;
  const platformFee = Math.round(basePrice * 0.05);
  const totalEstimated = basePrice + logisticsFee + platformFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsConsent) {
      showToast('Please consent to booking and cancellation terms.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/bookings/new', {
        method: 'POST',
        body: JSON.stringify({
          listing_id: listing.id,
          customer_contact: contactPhone,
          service_location: serviceLocation,
          category_requirements: categoryRequirements,
          scheduled_dates: { start: startDate, end: endDate },
          additional_notes: additionalNotes,
          quantity,
          terms_consent: termsConsent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit booking request');

      showToast('Booking request recorded successfully!', 'success');
      navigate(`/dashboard/bookings/${data.booking.id}/confirmation`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/dashboard/listings/${listing.id}`)}
          className="text-xs text-forest font-semibold hover:underline flex items-center space-x-1 mb-2"
        >
          <span>←</span> <span>Back to Listing Details</span>
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Request Service Booking
        </h1>
        <p className="text-xs text-slate-500">
          Submission creates a pending request. You will only pay after the provider reviews and formally accepts your scope & dates.
        </p>
      </div>

      {/* Listing Summary Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center space-x-4">
        <img
          src={listing.cover_image}
          alt={listing.title}
          className="w-16 h-16 rounded-2xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            {listing.category}
          </span>
          <h3 className="text-xs font-bold text-slate-900 truncate mt-1">{listing.title}</h3>
          <p className="text-[11px] text-slate-500">
            Provider: <span className="font-semibold text-slate-700">{listing.provider_name}</span> • Rate: <span className="font-bold text-forest">₦{listing.price.toLocaleString()} / {listing.pricing_unit}</span>
          </p>
        </div>
      </div>

      {/* Multi-Step Indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-bold">
        <div className={`flex items-center space-x-1.5 ${step >= 1 ? 'text-forest' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-forest text-white' : 'bg-slate-200'}`}>1</span>
          <span>Scope & Dates</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200"></div>
        <div className={`flex items-center space-x-1.5 ${step >= 2 ? 'text-forest' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-forest text-white' : 'bg-slate-200'}`}>2</span>
          <span>Location & Specs</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200"></div>
        <div className={`flex items-center space-x-1.5 ${step >= 3 ? 'text-forest' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-forest text-white' : 'bg-slate-200'}`}>3</span>
          <span>Review & Consent</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 1: Service Quantity & Schedule
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Quantity / Units ({listing.pricing_unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-forest"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Direct Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-forest"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-forest"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-forest"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-forest text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-forest-700 transition"
              >
                Proceed to Location & Requirements →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 2: Service Location & Category Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={serviceLocation.state}
                  onChange={(e) => setServiceLocation({ ...serviceLocation, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">LGA</label>
                <input
                  type="text"
                  value={serviceLocation.lga}
                  onChange={(e) => setServiceLocation({ ...serviceLocation, lga: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Town / Community</label>
                <input
                  type="text"
                  value={serviceLocation.town}
                  onChange={(e) => setServiceLocation({ ...serviceLocation, town: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Farm / Site Specific Landmark or Access Directions
              </label>
              <input
                type="text"
                placeholder="e.g. 5km along Zaria-Kano expressway, opposite Dambo primary school"
                value={serviceLocation.details}
                onChange={(e) => setServiceLocation({ ...serviceLocation, details: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
              />
            </div>

            {/* Category Custom Requirements */}
            {listing.category === 'farmland' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Intended Crop Rotation</label>
                <input
                  type="text"
                  placeholder="e.g. Hybrid Maize & Soybean dry season cultivation"
                  onChange={(e) => setCategoryRequirements({ ...categoryRequirements, intended_crop: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                />
              </div>
            )}
            {listing.category === 'machinery' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Arrangement</label>
                  <select
                    onChange={(e) => setCategoryRequirements({ ...categoryRequirements, fuel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                  >
                    <option value="client_supplies_ago">Client supplies AGO (Diesel) on site</option>
                    <option value="provider_supplies_fuel">Include fuel-at-cost in final agreement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operator Requirement</label>
                  <select
                    onChange={(e) => setCategoryRequirements({ ...categoryRequirements, operator: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                  >
                    <option value="certified_operator_included">Provider Certified Operator Included</option>
                    <option value="client_operator">Client Provides Own Operator</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Instructions or Conditions
              </label>
              <textarea
                rows={3}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Mention any terrain details, storage requirements, or timing constraints..."
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-forest"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-forest text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-forest-700 transition"
              >
                Review Estimate & Submit →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Step 3: Financial Estimate & Agreement Consent
            </h2>

            {/* Grounded Price Breakdown Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Platform Estimated Total (Pending Provider Review)
              </h3>
              <div className="flex justify-between text-slate-700">
                <span>{quantity} x Base Rate (₦{listing.price.toLocaleString()} / {listing.pricing_unit})</span>
                <span className="font-semibold">₦{basePrice.toLocaleString()}</span>
              </div>
              {logisticsFee > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Logistics Transport (Flatbed Estimate)</span>
                  <span className="font-semibold">₦{logisticsFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>Platform Security Holding Fee (5%)</span>
                <span className="font-semibold">₦{platformFee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Estimated Total:</span>
                <span className="text-forest text-base">₦{totalEstimated.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-500 italic pt-1">
                Important: This estimate is not a payment debit. The provider will review your location and parameters, and may accept or propose revised terms. You will review finalized terms before any payment is authorized.
              </p>
            </div>

            {/* Terms and Policy Consent Checkbox (Non-negotiable Rule 8) */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsConsent}
                  onChange={(e) => setTermsConsent(e.target.checked)}
                  className="mt-0.5 rounded text-forest focus:ring-forest"
                  required
                />
                <span className="text-xs text-slate-800 leading-relaxed">
                  I understand that this submission creates a <strong>Pending Booking Request</strong> only. I agree that payment will be processed through <strong>Bach Payment Gateway</strong> into platform secured holding only after the provider accepts and confirms dates. Both parties must independently confirm completion before funds are settled.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-full"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={submitting || !termsConsent}
                className="bg-forest hover:bg-forest-700 disabled:opacity-40 text-white text-xs font-bold px-8 py-3 rounded-full transition shadow-card flex items-center space-x-2"
              >
                {submitting ? (
                  <span>Recording Booking Request...</span>
                ) : (
                  <>
                    <span>Submit Booking Request</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

