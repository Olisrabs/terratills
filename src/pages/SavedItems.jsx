import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function SavedItems() {
  const { navigate, apiFetch, showToast, currentUser } = useApp();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchSaved = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/saved');
      if (!res.ok) throw new Error('Failed to load saved items');
      const data = await res.json();
      setSavedListings(data.map((l) => ({ ...l, is_saved: true })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [currentUser]);

  const handleSaveToggle = (id, stillSaved) => {
    if (!stillSaved) {
      setSavedListings((prev) => prev.filter((l) => l.id !== id));
    }
  };

  if (loading) return <LoadingView message="Loading your bookmarked agricultural services..." />;
  if (error) return <ErrorView error={error} onRetry={fetchSaved} />;

  const filtered = savedListings.filter((l) => !categoryFilter || l.category === categoryFilter);

  return (
    <div className="space-y-6 pb-16 px-4 md:px-6 pt-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Saved Listings</h1>
          <p className="text-xs text-slate-500">
            Bookmarked farmlands, machinery fleets, and courses for seasonal deployment.
          </p>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-slate-200 text-xs rounded-full px-3 py-1.5 text-slate-700 self-start sm:self-auto"
        >
          <option value="">All Saved Categories</option>
          <option value="farmland">Farmland</option>
          <option value="machinery">Machinery</option>
          <option value="labour">Labour</option>
          <option value="training">Training</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyView
          icon="❤️"
          title="No saved listings found"
          description="Click the heart icon on any farmland or tractor rental to save it here for fast access."
          actionLabel="Explore Marketplace"
          onAction={() => navigate('/dashboard/explore')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onSaveToggle={handleSaveToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

