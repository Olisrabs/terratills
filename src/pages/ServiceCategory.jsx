import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function ServiceCategory() {
  const { routeParams, navigate, apiFetch } = useApp();
  const slug = routeParams.slug || 'farmland';

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    async function loadCategory() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/categories/${slug}`);
        if (!res.ok) throw new Error('Failed to load category details');
        const data = await res.json();
        setCategoryData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [slug]);

  if (loading) return <LoadingView message={`Loading ${slug} category listings & specifications...`} />;
  if (error) return <ErrorView error={error} />;

  const { category, listings = [] } = categoryData || {};

  // Category specific filter chips
  const getFilterChips = () => {
    switch (slug) {
      case 'farmland':
        return ['All Farmland', 'River Irrigation', 'Certificate of Occupancy (C of O)', 'Cleared & Tilled', '> 20 Hectares'];
      case 'machinery':
        return ['All Machinery', 'Tractors (4WD)', 'Combine Harvesters', 'Operator Included', 'Low Fuel Consumption'];
      case 'labour':
        return ['All Labour', 'Yam & Cassava Harvesting', 'Weeding & Spraying', '10+ Person Crew', 'Tools Provided'];
      case 'training':
        return ['All Training', 'Greenhouse Horticulture', 'Cassava Value Addition', 'Certificate Issued', 'Practical Masterclass'];
      default:
        return ['All'];
    }
  };

  return (
    <div className="space-y-6 pb-16 px-4 md:px-6 pt-4">
      
      {/* Category Banner */}
      <section className="bg-forest rounded-3xl p-6 text-white shadow-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider block mb-1">
              Agricultural Category
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mb-2">
              {category?.name || slug}
            </h1>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              {category?.description}
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard/services/new')}
            className="bg-emerald-400 hover:bg-emerald-300 text-forest-900 text-xs font-bold px-4 py-2.5 rounded-full transition shadow-xs whitespace-nowrap self-start md:self-auto"
          >
            + List {category?.shortName || 'Service'} in this Category
          </button>
        </div>
      </section>

      {/* Category-Specific Filter Attributes Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        {getFilterChips().map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === chip
                ? 'bg-forest text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-300'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Available {category?.shortName} Listings ({listings.length})
          </h2>
          <span className="text-xs text-slate-400">Strictly verified contracts</span>
        </div>

        {listings.length === 0 ? (
          <EmptyView
            icon="🌾"
            title={`No ${category?.name} listings found`}
            description="Be the first to list verified services in this agricultural category."
            actionLabel="List a Service"
            onAction={() => navigate('/dashboard/services/new')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

