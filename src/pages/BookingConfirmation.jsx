import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { LoadingView, ErrorView } from '../components/StateViews';

export default function BookingConfirmation() {
  const { routeParams, navigate, apiFetch } = useApp();
  const bookingId = routeParams.bookingId;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBooking() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error('Booking not found');
        const data = await res.json();
        setBooking(data.booking);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  if (loading) return <LoadingView message="Retrieving booking confirmation receipt..." />;
  if (error) return <ErrorView error={error} />;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 md:px-6 space-y-6 text-center">
      
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-forest flex items-center justify-center mx-auto text-3xl shadow-sm">
        ✓
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Booking Request Submitted
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
          Request Sent to Service Provider
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Your request has been delivered to <span className="font-semibold text-slate-800">{booking.provider_name}</span>. You will receive an immediate notification once terms are accepted.
        </p>
      </div>

      {/* Confirmation Details Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card text-left space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Booking Reference</span>
            <span className="text-sm font-extrabold text-slate-900">{booking.reference}</span>
          </div>
          <StatusBadge type="booking" status={booking.status} />
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Service Listing:</span>
            <span className="font-bold text-slate-900 text-right">{booking.listing_title}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Service Provider:</span>
            <span className="font-semibold text-slate-800">{booking.provider_name}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Requested Dates:</span>
            <span className="font-semibold text-slate-800">{booking.scheduled_dates?.start} to {booking.scheduled_dates?.end}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Service Location:</span>
            <span className="font-semibold text-slate-800">{booking.service_location?.town}, {booking.service_location?.state}</span>
          </div>
          <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
            <span>Estimated Total:</span>
            <span className="font-extrabold text-forest text-sm">
              ₦{booking.amount_breakdown?.total_amount?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Next Step Info Box */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/70 text-xs text-amber-950 space-y-1">
          <h4 className="font-bold flex items-center space-x-1">
            <span>ℹ️</span> <span>Next Step: Provider Agreement</span>
          </h4>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            In compliance with TerraTills marketplace rules, your card or bank account has NOT been debited. When the provider accepts your requested schedule and terms, your booking status will change to <em>Awaiting Payment</em>, allowing you to review agreed terms and complete payment via Bach Gateway.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
        <button
          onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
          className="bg-forest hover:bg-forest-700 text-white text-xs font-bold px-6 py-3 rounded-full transition shadow-xs"
        >
          View Full Booking Record →
        </button>
        <button
          onClick={() => navigate('/dashboard/explore')}
          className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-6 py-3 rounded-full border border-slate-200 transition"
        >
          Explore More Services
        </button>
      </div>
    </div>
  );
}

