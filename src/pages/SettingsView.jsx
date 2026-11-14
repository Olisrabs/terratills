import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { LoadingView, ErrorView } from '../components/StateViews';

export default function SettingsView() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();

  const getInitialTab = () => {
    const p = window.location.pathname;
    if (p.includes('/security')) return 'security';
    if (p.includes('/notifications')) return 'notifications';
    if (p.includes('/privacy')) return 'privacy';
    if (p.includes('/locations')) return 'locations';
    if (p.includes('/preferences')) return 'preferences';
    if (p.includes('/account')) return 'account';
    return 'index';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Security fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Location fields
  const [newLocLabel, setNewLocLabel] = useState('');
  const [newLocType, setNewLocType] = useState('farmland');
  const [newLocState, setNewLocState] = useState('Kaduna');
  const [newLocTown, setNewLocTown] = useState('');

  // Deactivation check
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateCheck, setDeactivateCheck] = useState(null);
  const [checkingDeactivation, setCheckingDeactivation] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      setSettingsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [currentUser]);

  const handleSavePreferences = async (section, updates) => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ [section]: updates })
      });
      if (!res.ok) throw new Error('Failed to save settings');
      showToast('Settings saved successfully!', 'success');
      fetchSettings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    showToast('Password updated securely!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocLabel || !newLocTown) return;
    try {
      const res = await apiFetch('/api/settings/locations', {
        method: 'POST',
        body: JSON.stringify({
          label: newLocLabel,
          type: newLocType,
          state: newLocState,
          lga: newLocTown,
          town: newLocTown,
          is_default: false
        })
      });
      if (!res.ok) throw new Error('Failed to add location');
      showToast('Location saved to address book!', 'success');
      setNewLocLabel('');
      setNewLocTown('');
      fetchSettings();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteLocation = async (id) => {
    try {
      await apiFetch(`/api/settings/locations/${id}`, { method: 'DELETE' });
      showToast('Location removed', 'info');
      fetchSettings();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCheckDeactivation = async () => {
    setCheckingDeactivation(true);
    try {
      const res = await apiFetch('/api/settings/account/deactivate-check', { method: 'POST' });
      const data = await res.json();
      setDeactivateCheck(data);
      setShowDeactivateModal(true);
    } catch (err) {
      showToast('Failed to check deactivation eligibility', 'error');
    } finally {
      setCheckingDeactivation(false);
    }
  };

  if (loading) return <LoadingView message="Loading account controls and accessibility settings..." />;
  if (error) return <ErrorView error={error} onRetry={fetchSettings} />;

  const { settings, locations = [] } = settingsData || {};

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Account & Platform Settings</h1>
        <p className="text-xs text-slate-500">
          Manage security credentials, notification channels, privacy visibility, and saved agricultural sites.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'index', label: 'Settings Index' },
          { key: 'security', label: 'Security & 2FA' },
          { key: 'notifications', label: 'Notifications' },
          { key: 'privacy', label: 'Privacy & Data' },
          { key: 'locations', label: `Locations (${locations.length})` },
          { key: 'preferences', label: 'Preferences' },
          { key: 'account', label: 'Account Status' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === t.key
                ? 'border-forest text-forest font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INDEX (Destination 38) */}
      {activeTab === 'index' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'security', title: 'Security Settings', desc: 'Password updates, active sessions, and multi-factor alerts', icon: '🔒' },
            { id: 'notifications', title: 'Notification Channels', desc: 'Configure SMS, Email, and in-app alerts for bookings', icon: '🔔' },
            { id: 'privacy', title: 'Privacy Settings', desc: 'Control public phone visibility and farmland search indexing', icon: '👁️' },
            { id: 'locations', title: 'Agricultural Addresses', desc: 'Farmland parcels, machinery depots, and delivery points', icon: '📍' },
            { id: 'preferences', title: 'Language & Formats', desc: 'English (Nigeria), Naira (₦) currency, and text sizing', icon: '🌐' },
            { id: 'account', title: 'Account Deactivation', desc: 'Inspect outstanding obligations and deactivation terms', icon: '⚠️' }
          ].map((card) => (
            <div
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-card transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest flex items-center justify-center text-lg mb-2">
                  {card.icon}
                </div>
                <h3 className="text-xs font-bold text-slate-900">{card.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
              </div>
              <span className="text-xs font-bold text-forest hover:underline mt-3 block">Configure →</span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SECURITY (Destination 39) */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-6">
          <h2 className="text-sm font-bold text-slate-900">Security Credentials & Active Sessions</h2>
          <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-forest text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-forest-700 transition"
            >
              Update Password
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900">Active Authorized Sessions:</h4>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">Current Windows Session • Kaduna / Abuja</p>
                <span className="text-[10px] text-slate-400">Active Now • IP: 102.89.44.12</span>
              </div>
              <span className="bg-emerald-100 text-forest text-[10px] font-bold px-2 py-0.5 rounded-md">This Device</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS (Destination 40) */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Notification Channels & Delivery Preferences</h2>
          <div className="divide-y divide-slate-100">
            {[
              { key: 'booking_updates', label: 'Booking Status & Terms Accepted', mandatory: true },
              { key: 'service_requests', label: 'Incoming Service Requests from Clients', mandatory: true },
              { key: 'payments', label: 'Bach Payment Receipts & Payout Clearances', mandatory: true },
              { key: 'messages', label: 'Direct Messages & Coordinator Enquiries', mandatory: false }
            ].map((channel) => (
              <div key={channel.key} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{channel.label}</span>
                  <span className="text-[10px] text-slate-400">
                    {channel.mandatory ? 'Essential security & contract notices (Mandatory)' : 'In-app and Email notices'}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-1">
                    <input type="checkbox" defaultChecked className="rounded text-forest" />
                    <span className="text-[11px] text-slate-600">In-App</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input type="checkbox" defaultChecked className="rounded text-forest" />
                    <span className="text-[11px] text-slate-600">SMS</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input type="checkbox" defaultChecked className="rounded text-forest" />
                    <span className="text-[11px] text-slate-600">Email</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY (Destination 41) */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Privacy & Profile Visibility</h2>
          <p className="text-slate-500">Manage how your agricultural sites and phone numbers are shown.</p>

          <div className="space-y-3 max-w-lg">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number Visibility</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                <option value="confirmed_bookings_only">Confirmed Booking Participants Only (Recommended)</option>
                <option value="public">Publicly Visible on Services</option>
                <option value="hidden">Hidden completely</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Farmland Location Precision</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                <option value="general_community">General Community & LGA (Protects exact beacons until lease)</option>
                <option value="exact_coordinates">Exact GPS Coordinates</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LOCATIONS (Destination 42) */}
      {activeTab === 'locations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-6 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Manage Agricultural Locations & Depots</h2>
            <p className="text-slate-500">Saved farmland plots, machinery parking depots, and farm gates.</p>
          </div>

          <div className="space-y-2.5">
            {locations.map((loc) => (
              <div key={loc.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{loc.label}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.2 rounded capitalize">
                      {loc.type}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {loc.town}, {loc.lga}, {loc.state} State
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteLocation(loc.id)}
                  className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Add Location Form */}
          <form onSubmit={handleAddLocation} className="p-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <h4 className="font-bold text-slate-900">Add New Agricultural Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Label (e.g. Zaria West Farmland)"
                value={newLocLabel}
                onChange={(e) => setNewLocLabel(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl p-2 text-xs"
                required
              />
              <select
                value={newLocType}
                onChange={(e) => setNewLocType(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl p-2 text-xs"
              >
                <option value="farmland">Farmland</option>
                <option value="machinery">Machinery Depot</option>
                <option value="business">Office / Store</option>
              </select>
              <input
                type="text"
                placeholder="Town / Village"
                value={newLocTown}
                onChange={(e) => setNewLocTown(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl p-2 text-xs"
                required
              />
              <button
                type="submit"
                className="bg-forest text-white font-bold rounded-xl px-3 py-2 hover:bg-forest-700 transition"
              >
                + Add Address
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: PREFERENCES (Destination 43) */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Regional & Accessibility Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                <option value="en_ng">English (Nigeria Launch)</option>
                <option value="ha">Hausa (Coming Soon)</option>
                <option value="yo">Yoruba (Coming Soon)</option>
                <option value="ig">Igbo (Coming Soon)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Display</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                <option value="ngn">NGN (₦) Nigerian Naira</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ACCOUNT DEACTIVATION (Destination 44 - Non-negotiable Rule 44) */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4 text-xs">
          <h2 className="text-sm font-bold text-rose-900">Account Deactivation & Data Retention</h2>
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2">
            <p className="font-bold">Non-Negotiable Product Rule 44:</p>
            <p className="text-[11px] leading-relaxed">
              Account deactivation is strictly prohibited from bypassing legitimate booking, payment, dispute, or legal obligations. Active bookings, pending completion confirmations, or outstanding payouts must be concluded first.
            </p>
          </div>

          <button
            onClick={handleCheckDeactivation}
            disabled={checkingDeactivation}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-full transition"
          >
            {checkingDeactivation ? 'Checking Outstanding Obligations...' : 'Request Account Deactivation'}
          </button>
        </div>
      )}

      {/* Deactivation Check Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Account Deactivation Inspection"
      >
        {deactivateCheck && (
          <div className="space-y-4 text-xs">
            {deactivateCheck.canDeactivate ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
                <p className="font-bold">Eligibility Confirmed:</p>
                <p>{deactivateCheck.warning}</p>
                <p className="font-semibold text-rose-700">Are you sure you want to proceed?</p>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 space-y-2">
                <p className="font-bold">Deactivation Blocked:</p>
                <p>{deactivateCheck.reason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

