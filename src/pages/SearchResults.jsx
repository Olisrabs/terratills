import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function SearchResults() {
  const { routeQuery, navigate, apiFetch } = useApp();

  const [query, setQuery] = useState(routeQuery.get('q') || '');
  const [category, setCategory] = useState(routeQuery.get('category') || '');
  const [state, setState] = useState(routeQuery.get('state') || '');
  const [minPrice, setMinPrice] = useState(routeQuery.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(routeQuery.get('max_price') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(routeQuery.get('verified') === 'true');
  const [sort, setSort] = useState(routeQuery.get('sort') || 'relevance');
  const [page, setPage] = useState(parseInt(routeQuery.get('page') || '1'));

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const NIGERIAN_STATES = ['All Nigeria', 'Kaduna', 'Oyo', 'Ogun', 'Benue', 'Plateau', 'Kano', 'Ondo', 'Edo', 'Niger'];

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        search: query,
        category,
        state: state === 'All Nigeria' ? '' : state,
        min_price: minPrice,
        max_price: maxPrice,
        verified: verifiedOnly ? 'true' : '',
        sort,
        page: page.toString(),
        limit: '12'
      });

      const res = await apiFetch(`/api/listings?${params.toString()}`);
      if (!res.ok) throw new Error('Search request failed');
      const data = await res.json();
      setResults(data.results || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [category, state, sort, page, verifiedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResults();
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setState('');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
    setSort('relevance');
    setPage(1);
    navigate('/dashboard/explore/search');
  };

  return (
    <div className="space-y-6 pb-16 px-4 md:px-6 pt-4">
      
      {/* Search Header Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by crop, tractor HP, worker duties, or state..."
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 text-xs rounded-full px-3 py-2 text-slate-700"
            >
              <option value="">All Categories</option>
              <option value="farmland">Farmland Leasing</option>
              <option value="machinery">Machinery Rental</option>
              <option value="labour">Farm Labour</option>
              <option value="training">Training & Tutorials</option>
            </select>

            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 text-xs rounded-full px-3 py-2 text-slate-700"
            >
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 text-xs rounded-full px-3 py-2 text-slate-700"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Listed</option>
            </select>

            <button
              type="submit"
              className="bg-forest text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-forest-700 transition"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Filter Chips row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">{pagination.total} listings found</span>
            {category && (
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Category: {category}
              </span>
            )}
            {state && (
              <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                State: {state}
              </span>
            )}
            {verifiedOnly && (
              <span className="bg-forest text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Verified Only
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-forest focus:ring-forest"
              />
              <span className="text-[11px] font-medium">Verified providers only</span>
            </label>

            {(query || category || state || verifiedOnly) && (
              <button
                onClick={clearFilters}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results View */}
      {loading ? (
        <LoadingView message="Searching verified agricultural inventory..." />
      ) : error ? (
        <ErrorView error={error} onRetry={fetchResults} />
      ) : results.length === 0 ? (
        <EmptyView
          icon="🔍"
          title="No matching listings found"
          description="Try broadening your location radius, adjusting your price criteria, or checking another agricultural category."
          actionLabel="Clear Filters & Reset"
          onAction={clearFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

