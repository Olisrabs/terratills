import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import { LoadingView, ErrorView } from '../components/StateViews';

export default function ProfileView() {
  const { routeParams, navigate, apiFetch, showToast, currentUser, logout } = useApp();
  const isEditing = window.location.pathname.includes('/edit');

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Edit fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [town, setTown] = useState('');
  const [state, setState] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfileData(data);
      setDisplayName(data.user?.displayName || data.user?.name || '');
      setBio(data.user?.bio || '');
      setPhone(currentUser?.phone || '');
      setTown(data.user?.location?.town || '');
      setState(data.user?.location?.state || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser, isEditing]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/profile/edit', {
        method: 'PUT',
        body: JSON.stringify({
          displayName,
          bio,
          phone,
          location: { town, state }
        })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      showToast('Profile information updated successfully!', 'success');
      navigate('/dashboard/profile');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingView message="Loading verified public profile..." />;
  if (error) return <ErrorView error={error} onRetry={fetchProfile} />;

  const { user, activeServices = [], reviews = [] } = profileData || {};

  return (
    <div className="max-w-4xl mx-auto pt-4 md:pt-6 pb-20 px-4 md:px-6 space-y-6">
      
      {/* Profile Header Hero */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-emerald-300/40 overflow-hidden bg-emerald-800 flex items-center justify-center">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => navigate(isEditing ? '/dashboard/profile' : '/dashboard/profile/edit')}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-forest hover:bg-forest-700 text-white border-2 border-white rounded-full flex items-center justify-center text-xs shadow-sm transition transform hover:scale-110 active:scale-95 cursor-pointer"
              title={isEditing ? 'Cancel Edit' : 'Edit Profile'}
              aria-label="Edit Profile"
            >
              ✏️
            </button>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-extrabold text-slate-900">{user?.displayName || user?.name}</h1>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            </div>
            <p className="text-xs text-forest font-semibold mt-0.5">{user?.badge}</p>
          </div>
        </div>

        {isEditing && (
          <div>
            <button
              onClick={() => navigate('/dashboard/profile')}
              className="bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-2 rounded-full hover:bg-slate-200 transition"
            >
              Cancel Edit
            </button>
          </div>
        )}
      </div>

      {/* EDIT FORM (Destination 35) */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Edit Profile Information</h2>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Display Name (Public)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Biography & Agro Credentials</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Town / Community</label>
              <input
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number (Private / Booking only)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/dashboard/profile')}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-forest text-white font-bold px-6 py-2 rounded-full hover:bg-forest-700 disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Save Profile Changes ✓'}
            </button>
          </div>
        </form>
      ) : (
        /* PUBLIC SUMMARY (Destination 34) */
        <div className="space-y-6">
          {/* Trust & Verification Card (Moved from Dashboard) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trust & Verification</span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Level 2</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {user?.badge || currentUser?.badge || 'Verified Agro-Producer 🌿'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your identity and machinery documentation are confirmed. Farmland authority review is active.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">98% Completion</span>
              <button
                onClick={() => navigate('/dashboard/verification')}
                className="text-xs font-bold text-forest hover:underline"
              >
                Verification Centre →
              </button>
            </div>
          </div>

          {/* Account Navigation Cards */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Settings & Links</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { icon: '✏️', label: 'Edit Profile', sub: 'Update your name, bio and location', path: '/dashboard/profile/edit' },
                { icon: '🛡️', label: 'Verification Centre', sub: 'Manage identity & document verification', path: '/dashboard/verification' },
                { icon: '⚙️', label: 'Account Settings', sub: 'Security, notifications and privacy', path: '/dashboard/settings' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition group text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center text-base transition">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.sub}</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-forest transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              {/* Logout Option in Account List */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-rose-50/60 transition group text-left text-rose-600"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center text-base transition">
                    🚪
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-600">Log Out</p>
                    <p className="text-[11px] text-rose-400">Sign out of your active session</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-rose-300 group-hover:text-rose-600 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Direct Sign Out Action Card */}
          <div className="pt-1">
            <button
              onClick={logout}
              className="w-full py-3.5 px-4 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 transition shadow-xs flex items-center justify-center space-x-2"
            >
              <span>🚪</span>
              <span>Log Out of Dashboard</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

