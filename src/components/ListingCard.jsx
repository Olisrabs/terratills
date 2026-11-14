import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ListingCard({ listing, onSaveToggle }) {
  const { navigate, apiFetch, showToast } = useApp();
  const [isSaved, setIsSaved] = useState(listing.is_saved || false);
  const [isToggling, setIsToggling] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    setIsToggling(true);
    try {
      const res = await apiFetch('/api/saved/toggle', {
        method: 'POST',
        body: JSON.stringify({ listing_id: listing.id })
      });
      const data = await res.json();
      setIsSaved(data.saved);
      if (onSaveToggle) onSaveToggle(listing.id, data.saved);
      showToast(data.saved ? 'Added to Saved Items' : 'Removed from Saved Items', 'info');
    } catch (err) {
      showToast('Could not update saved items', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat.toLowerCase()) {
      case 'farmland':
        return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Farmland</span>;
      case 'machinery':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Machinery</span>;
      case 'labour':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Labour</span>;
      case 'training':
        return <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Training</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{cat}</span>;
    }
  };

  return (
    <div
      onClick={() => navigate(`/dashboard/listings/${listing.id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-card hover:border-emerald-200 transition cursor-pointer flex flex-col h-full"
    >
      {/* Image container */}
      <div className="h-40 w-full overflow-hidden relative bg-slate-100">
        <img
          src={listing.cover_image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {getCategoryBadge(listing.category)}
            {listing.verified && (
              <span className="bg-forest/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center shadow-xs">
                <span className="mr-1">✓</span> Verified
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isToggling}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-xs ${
              isSaved
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white/90 backdrop-blur-xs text-slate-500 hover:text-rose-500'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Listing'}
          >
            <svg
              className={`w-4 h-4 ${isSaved ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-current'}`}
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center text-[11px] font-medium text-slate-400 mb-1 space-x-1">
            <svg className="w-3.5 h-3.5 text-forest shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path clipRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" fillRule="evenodd"></path>
            </svg>
            <span className="truncate">{listing.location ? `${listing.location.town}, ${listing.location.state}` : 'Nigeria'}</span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-forest transition leading-snug">
            {listing.title}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
            By <span className="font-medium text-slate-700">{listing.provider_name}</span>
          </p>
        </div>

        {/* Pricing row */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Pricing Basis</span>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">
              ₦{Number(listing.price).toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 ml-1">/ {listing.pricing_unit}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              Available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

