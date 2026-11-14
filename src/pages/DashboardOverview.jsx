import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { LoadingView, ErrorView } from '../components/StateViews';

export default function DashboardOverview() {
  const { currentUser, navigate, apiFetch, showToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [mobileSearch, setMobileSearch] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, catRes, listingsRes] = await Promise.all([
        apiFetch('/api/dashboard/overview'),
        apiFetch('/api/categories'),
        apiFetch('/api/listings?limit=5'),
      ]);
      if (!overviewRes.ok) throw new Error('Failed to load dashboard overview data');
      const json = await overviewRes.json();
      const catJson = await catRes.json();
      const listingsJson = await listingsRes.json();
      setData(json);
      setFeaturedListings(listingsJson.results || []);
      setCategories(catJson);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [currentUser]);

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate('/dashboard/explore/search', { q: mobileSearch.trim() });
    }
  };

  if (loading) return <LoadingView message="Assembling your unified agricultural dashboard..." />;
  if (error) return <ErrorView error={error} onRetry={fetchOverview} />;

  const { metrics, recentBookings, myServices, incomingRequests, recentTransactions } = data || {};

  // Extract first name only
  const firstName = (currentUser?.displayName || currentUser?.name || '').split(' ')[0];

  // Category colour map (same as ExploreServices)
  const catColors = {
    farmland: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: '🌾' },
    machinery: { bg: 'bg-blue-50', text: 'text-blue-600', icon: '🚜' },
    labour: { bg: 'bg-amber-50', text: 'text-amber-600', icon: '👥' },
    training: { bg: 'bg-purple-50', text: 'text-purple-600', icon: '🎓' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* BEGIN: HeroHeader styled like new.html */}
      <section className="bg-forest pt-5 pb-7 px-5 md:px-8 rounded-b-[36px] text-white shadow-card relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Greeting row — avatar on mobile beside name */}
          <div className="flex items-center justify-between gap-3 md:block">
            {/* Left: greeting text */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
                Hello, {firstName}
              </h1>
              <p className="text-xs text-emerald-100/90 mt-0.5 flex items-center space-x-1">
                <span>Today:</span>
                <span className="font-semibold">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </p>
            </div>

            {/* Mobile-only: user avatar — click goes to profile page */}
            <button
              onClick={() => navigate('/dashboard/profile')}
              className="md:hidden flex-shrink-0 relative"
              aria-label="My Profile"
            >
              <div className="w-11 h-11 rounded-full border-2 border-emerald-300/50 overflow-hidden bg-emerald-800 flex items-center justify-center shadow-md">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                  alt={currentUser?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online indicator dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-forest rounded-full"></span>
            </button>
          </div>

          {/* Mobile: Functional search bar  |  Desktop: removed entirely */}
          <div className="md:hidden">
            <form onSubmit={handleMobileSearch} className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-200/80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" strokeLinecap="round"></circle>
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round"></path>
                </svg>
              </div>
              <input
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                type="text"
                placeholder="Search farmland, tractors, farm labour..."
                className="w-full bg-[#1A6145] text-white placeholder-emerald-200/70 text-xs rounded-full pl-9 pr-9 py-2.5 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
              />
              {mobileSearch && (
                <button
                  type="button"
                  onClick={() => setMobileSearch('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-200 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

        </div>
      </section>

      {/* Explore by Category — single-row horizontal scroll, both mobile & desktop */}
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Explore by Category</h2>
          <button
            onClick={() => navigate('/dashboard/explore')}
            className="text-xs text-slate-400 font-semibold hover:text-forest transition"
          >
            See all →
          </button>
        </div>
        <div className="flex flex-nowrap gap-3 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const colors = catColors[cat.slug] || { bg: 'bg-slate-50', text: 'text-slate-600', icon: '🌱' };
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => navigate(`/dashboard/explore/category/${cat.slug}`)}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-emerald-200 hover:shadow-card transition text-center group flex-shrink-0 w-32 sm:w-auto sm:flex-1"
              >
                <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center mb-2 text-xl group-hover:scale-105 transition`}>
                  {colors.icon}
                </div>
                <span className="text-xs font-bold text-slate-800 block">{cat.shortName || cat.name}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incoming Requests & Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incoming Service Requests Section */}
          {incomingRequests && incomingRequests.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-amber-950">Action Needed: Incoming Requests</h3>
                </div>
                <button
                  onClick={() => navigate('/dashboard/service-requests')}
                  className="text-xs font-bold text-amber-900 hover:underline"
                >
                  View All ({metrics?.incomingRequestsCount})
                </button>
              </div>

              <div className="space-y-2.5">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/dashboard/service-requests/${req.id}`)}
                    className="bg-white p-3.5 rounded-2xl border border-amber-200/60 shadow-xs hover:border-amber-400 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={req.customer_avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200'}
                        alt={req.customer_name}
                        className="w-10 h-10 rounded-full object-cover border border-amber-300"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{req.customer_name}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{req.listing_title}</p>
                        <span className="text-[10px] text-amber-800 font-semibold">{req.proposed_scope}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        ₦{req.proposed_amount.toLocaleString()}
                      </span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1">
                        Review Terms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services You Can Book — horizontal scroll, up to 5, then See All */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Services Near You</h3>
                <p className="text-xs text-slate-400">Tap any to view details & book</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/explore')}
                className="text-xs font-bold text-forest hover:underline"
              >
                See all →
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {featuredListings.slice(0, 5).map((listing) => {
                const catMeta = {
                  farmland: { icon: '🌾', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                  machinery: { icon: '🚜', bg: 'bg-blue-50', text: 'text-blue-700' },
                  labour: { icon: '👥', bg: 'bg-amber-50', text: 'text-amber-700' },
                  training: { icon: '🎓', bg: 'bg-purple-50', text: 'text-purple-700' },
                }[listing.category] || { icon: '🌱', bg: 'bg-slate-50', text: 'text-slate-700' };
                return (
                  <div
                    key={listing.id}
                    onClick={() => navigate(`/dashboard/listings/${listing.id}`)}
                    className="flex-shrink-0 w-44 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-card transition cursor-pointer overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={listing.cover_image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400'}
                        alt={listing.title}
                        className="w-full h-24 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${catMeta.bg} ${catMeta.text}`}>
                        {catMeta.icon} {listing.category}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-1">{listing.title}</h4>
                      <p className="text-[11px] font-extrabold text-forest">₦{listing.price?.toLocaleString()}<span className="font-normal text-slate-400"> / {listing.pricing_unit}</span></p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">📍 {listing.location?.town}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
      </div>

      {/* AI FAB — mobile only, floats above bottom nav */}
      <button
        onClick={() => navigate('/dashboard/assistant')}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 bg-forest shadow-float rounded-full flex items-center justify-center text-2xl hover:bg-forest-700 active:scale-95 transition-all"
        aria-label="Open AI Agro Assistant"
        title="Agro AI Assistant"
      >
        🤖
      </button>
    </div>
  );
}
