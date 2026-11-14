import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LoadingView, ErrorView, PermissionDeniedView } from '../components/StateViews';

export default function EditService() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const listingId = routeParams.listingId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pricingUnit, setPricingUnit] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    async function loadService() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/listings/${listingId}`);
        if (!res.ok) throw new Error('Failed to load listing for editing');
        const data = await res.json();
        const l = data.listing;
        if (l.owner_id !== currentUser?.id) {
          setForbidden(true);
          return;
        }
        setTitle(l.title || '');
        setDescription(l.description || '');
        setPrice(l.price || '');
        setPricingUnit(l.pricing_unit || '');
        setCoverImage(l.cover_image || '');
        setStatus(l.status || 'active');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [listingId, currentUser]);

  if (loading) return <LoadingView message="Loading your service listing for editing..." />;
  if (forbidden) return <PermissionDeniedView reason="You can only edit service listings owned by your account." />;
  if (error) return <ErrorView error={error} />;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/api/services/${listingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          pricing_unit: pricingUnit,
          cover_image: coverImage,
          status
        })
      });
      if (!res.ok) throw new Error('Failed to update service listing');
      showToast('Service listing updated successfully! Historical accepted bookings remain preserved.', 'success');
      navigate(`/dashboard/services/${listingId}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      <div>
        <button
          onClick={() => navigate(`/dashboard/services/${listingId}`)}
          className="text-xs text-forest font-semibold hover:underline flex items-center space-x-1 mb-2"
        >
          <span>←</span> <span>Back to Service Management</span>
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Service Listing</h1>
        <p className="text-xs text-slate-500">
          Modifications here do NOT rewrite historical agreements on already accepted bookings (Rule 14).
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₦)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-bold"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Unit</label>
            <input
              type="text"
              value={pricingUnit}
              onChange={(e) => setPricingUnit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
          >
            <option value="active">Active (Visible in Marketplace)</option>
            <option value="paused">Paused (Temporarily Hidden)</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/services/${listingId}`)}
            className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-full"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-forest hover:bg-forest-700 text-white text-xs font-bold px-6 py-2.5 rounded-full transition shadow-xs"
          >
            {saving ? 'Saving...' : 'Save Changes ✓'}
          </button>
        </div>
      </form>
    </div>
  );
}

