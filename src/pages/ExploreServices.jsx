import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import { LoadingView, ErrorView } from '../components/StateViews';

export default function ExploreServices() {
  const { navigate, apiFetch } = useApp();
  const [categories, setCategories] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const NIGERIAN_STATES = ['All Nigeria', 'Kaduna', 'Oyo', 'Ogun', 'Benue', 'Plateau', 'Kano', 'Ondo', 'Edo', 'Niger'];

  useEffect(() => {
    async function loadExploreData() {
      setLoading(true);
      setError(null);
      try {
        const [catRes, listRes] = await Promise.all([
          apiFetch('/api/categories'),
          apiFetch('/api/listings?limit=8')
        ]);
        const catData = await catRes.json();
        const listData = await listRes.json();
        setCategories(catData);
        setFeaturedListings(listData.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadExploreData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/dashboard/explore/search', {
      q: searchKeyword,
      state: selectedState === 'All Nigeria' ? '' : selectedState
    });
  };

  if (loading) return <LoadingView message="Loading agricultural services and categories across Nigeria..." />;
  if (error) return <ErrorView error={error} />;

  return (
    <div className="space-y-6 pb-16 px-4 md:px-6 pt-4">
      
      {/* Search & Location Bar Banner */}
      <section className="bg-forest rounded-3xl p-6 text-white shadow-card relative overflow-hidden">
        <div className="max-w-xl">

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search tractors, hectare leases, harvesters..."
              className="flex-1 bg-[#1A6145] text-white placeholder-emerald-200/70 text-xs rounded-full px-4 py-2.5 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-[#1A6145] text-white text-xs rounded-full px-3 py-2.5 border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s} className="bg-forest text-white">
                  {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-emerald-400 hover:bg-emerald-300 text-forest-900 text-xs font-bold px-5 py-2.5 rounded-full transition shadow-xs"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* BEGIN: Invest / Discover by Category (Styled matching new.html lines 196-240) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Explore by Category</h2>
        </div>

        <div className="flex flex-nowrap gap-3 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            let colorClasses = {
              bg: 'bg-emerald-50',
              text: 'text-emerald-600',
              icon: '🌾'
            };
            if (cat.slug === 'machinery') {
              colorClasses = { bg: 'bg-blue-50', text: 'text-blue-600', icon: '🚜' };
            } else if (cat.slug === 'labour') {
              colorClasses = { bg: 'bg-amber-50', text: 'text-amber-600', icon: '👥' };
            } else if (cat.slug === 'training') {
              colorClasses = { bg: 'bg-purple-50', text: 'text-purple-600', icon: '🎓' };
            }

            return (
              <button
                key={cat.slug}
                onClick={() => navigate(`/dashboard/explore/category/${cat.slug}`)}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-emerald-200 hover:shadow-card transition text-center group flex-shrink-0 w-32 sm:w-auto sm:flex-1"
                type="button"
              >
                <div className={`w-11 h-11 rounded-xl ${colorClasses.bg} flex items-center justify-center mb-2 text-xl group-hover:scale-105 transition`}>
                  {colorClasses.icon}
                </div>
                <span className="text-xs font-bold text-slate-800 block">{cat.shortName || cat.name}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* BEGIN: Best Offers / Featured Listings (Horizontal scroll matching new.html lines 241-276) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Featured Offers</h2>
            <p className="text-xs text-slate-400">Verified contracts with verified title and certified machinery</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* AI Assistant Grounded Discovery Banner */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-forest text-white flex items-center justify-center text-xl shrink-0">
            🤖
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Need customized agricultural planning?</h3>
            <p className="text-[11px] text-slate-600">
              Our AI queries live platform rates to estimate total hectares, tractor diesel needs, or labour duration for your seasonal calendar.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/assistant')}
          className="bg-forest text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-forest-700 transition whitespace-nowrap shadow-xs"
        >
          Ask Agro AI →
        </button>
      </section>
    </div>
  );
}

