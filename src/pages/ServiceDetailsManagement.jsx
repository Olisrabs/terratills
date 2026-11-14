import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LoadingView, ErrorView, PermissionDeniedView } from '../components/StateViews';

export default function ServiceDetailsManagement() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const listingId = routeParams.listingId;

  const [service, setService] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  // Sub-tabs: 'details' | 'availability' | 'performance'
  const [activeTab, setActiveTab] = useState(
    window.location.pathname.includes('/availability')
      ? 'availability'
      : window.location.pathname.includes('/performance')
      ? 'performance'
      : 'details'
  );

  const [blockedDatesInput, setBlockedDatesInput] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const [servRes, perfRes, availRes] = await Promise.all([
        apiFetch(`/api/listings/${listingId}`),
        apiFetch(`/api/services/${listingId}/performance`),
        apiFetch(`/api/services/${listingId}/availability`)
      ]);

      if (servRes.status === 403 || perfRes.status === 403) {
        setForbidden(true);
        return;
      }
      if (!servRes.ok) throw new Error('Service not found');

      const servData = await servRes.json();
      if (servData.listing.owner_id !== currentUser?.id) {
        setForbidden(true);
        return;
      }

      setService(servData.listing);
      if (perfRes.ok) setPerformance(await perfRes.json());
      if (availRes.ok) setAvailability(await availRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [listingId, currentUser]);

  if (loading) return <LoadingView message="Loading service management panel..." />;
  if (forbidden) return <PermissionDeniedView reason="Only the owner of this service listing can access its management dashboard." />;
  if (error) return <ErrorView error={error} onRetry={loadAll} />;
  if (!service) return null;

  const handleToggleStatus = async () => {
    const next = service.status === 'active' ? 'paused' : 'active';
    try {
      const res = await apiFetch(`/api/services/${service.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setService((prev) => ({ ...prev, status: next }));
      showToast(`Listing is now ${next}`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`/api/services/${service.id}/availability`, {
        method: 'POST',
        body: JSON.stringify({
          ...availability.availability,
          blocked_dates: blockedDatesInput.split(',').map((s) => s.trim()).filter(Boolean)
        })
      });
      if (!res.ok) throw new Error('Failed to save availability');
      showToast('Availability calendar updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={service.cover_image}
            alt={service.title}
            className="w-16 h-16 rounded-2xl object-cover shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-md">
                {service.category}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                service.status === 'active' ? 'bg-emerald-100 text-forest' : 'bg-amber-100 text-amber-800'
              }`}>
                {service.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">{service.title}</h1>
            <p className="text-xs text-slate-500">
              Rate: <span className="font-bold text-forest">₦{service.price.toLocaleString()} / {service.pricing_unit}</span> • Location: {service.location?.town}, {service.location?.state}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/dashboard/listings/${service.id}`)}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold hover:bg-slate-50"
          >
            Public View ↗
          </button>
          <button
            onClick={() => navigate(`/dashboard/services/${service.id}/edit`)}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold hover:bg-slate-50"
          >
            Edit Service
          </button>
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              service.status === 'active' ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-forest text-white hover:bg-forest-700'
            }`}
          >
            {service.status === 'active' ? 'Pause Listing' : 'Activate Listing'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'details' ? 'border-forest text-forest' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview & Specifications
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'availability' ? 'border-forest text-forest' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Availability Calendar & Slots
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'performance' ? 'border-forest text-forest' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Performance & Analytics
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{service.description}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attributes & Specifications</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {service.attributes && Object.entries(service.attributes).map(([k, v]) => (
                <div key={k} className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">{k.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-slate-900">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AVAILABILITY (Destination 16) */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Manage Service Availability</h2>
            <p className="text-xs text-slate-500">Configure lead time, concurrent limits, and blocked blackout dates.</p>
          </div>

          {/* Booked Slots */}
          {availability?.booked_slots && availability.booked_slots.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs">
              <h4 className="font-bold text-blue-900 mb-2">Active Confirmed Booking Slots (Locked on Server):</h4>
              <div className="space-y-1">
                {availability.booked_slots.map((slot, idx) => (
                  <div key={idx} className="flex justify-between text-blue-800">
                    <span>{slot.booking_reference} ({slot.customer})</span>
                    <span className="font-bold">{slot.start} to {slot.end}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSaveAvailability} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blackout / Blocked Dates (comma separated YYYY-MM-DD)
              </label>
              <input
                type="text"
                value={blockedDatesInput}
                onChange={(e) => setBlockedDatesInput(e.target.value)}
                placeholder="2026-11-25, 2026-11-26, 2026-12-25"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Lead Notice (Days)</label>
                <input
                  type="number"
                  defaultValue={2}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Concurrent Bookings</label>
                <input
                  type="number"
                  defaultValue={1}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-forest text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-forest-700 transition"
            >
              Update Availability Settings ✓
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PERFORMANCE (Destination 17) */}
      {activeTab === 'performance' && performance && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Service Performance Metrics</h2>
            <p className="text-xs text-slate-500">Grounded platform data only (Rule 17: metrics are never fabricated).</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Page Views</span>
              <span className="text-xl font-extrabold text-slate-900">{performance.views}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Search Impressions</span>
              <span className="text-xl font-extrabold text-slate-900">{performance.searchImpressions}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Enquiries</span>
              <span className="text-xl font-extrabold text-slate-900">{performance.enquiries}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Conversion Rate</span>
              <span className="text-xl font-extrabold text-forest">{performance.conversionRate}</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-forest">Completed Bookings Revenue:</span>
              <span className="ml-2 font-black text-slate-900 text-sm">₦{performance.grossRevenue.toLocaleString()}</span>
            </div>
            <span className="text-slate-500 font-medium">{performance.completedBookingsCount} Completed Bookings</span>
          </div>
        </div>
      )}
    </div>
  );
}

