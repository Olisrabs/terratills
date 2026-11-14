import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function NotificationsView() {
  const { navigate, apiFetch, showToast, currentUser, setUnreadNotifCount } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to load notifications');
      const data = await res.json();
      setNotifications(data);
      setUnreadNotifCount(data.filter((n) => !n.read).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [currentUser]);

  const handleMarkAsRead = async (notif, e) => {
    e.stopPropagation();
    try {
      await apiFetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifCount(0);
      showToast('All notifications marked as read', 'info');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleOpenNotif = (notif) => {
    if (!notif.read) {
      apiFetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' });
    }
    navigate(notif.destination);
  };

  if (loading) return <LoadingView message="Loading alerts and transaction notifications..." />;
  if (error) return <ErrorView error={error} onRetry={fetchNotifs} />;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter !== 'all') return n.type === activeFilter;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500">
            Real-time updates regarding requests, Bach payments, and completion confirmations.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-forest hover:underline self-start sm:self-auto"
        >
          Mark all as read ✓
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
        {['all', 'unread', 'service_request', 'booking', 'booking_completion', 'payment'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === f ? 'bg-forest text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'service_request'
              ? 'Requests'
              : f === 'booking_completion'
              ? 'Completions'
              : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyView
          icon="🔔"
          title="No notifications in this filter"
          description="You are fully caught up with your platform activities."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleOpenNotif(notif)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                notif.read ? 'bg-white border-slate-100 hover:border-emerald-200' : 'bg-forest-50/70 border-emerald-200 shadow-xs'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg mt-0.5">
                  {notif.type === 'service_request'
                    ? '📥'
                    : notif.type === 'booking'
                    ? '📅'
                    : notif.type === 'payment'
                    ? '💳'
                    : notif.type === 'booking_completion'
                    ? '✅'
                    : '🔔'}
                </span>
                <div>
                  <div className="flex items-center space-x-2 mb-0.5">
                    <h3 className="text-xs font-bold text-slate-900">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-forest"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.summary}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-forest hover:underline block mb-2">
                  View Record →
                </span>
                {!notif.read && (
                  <button
                    onClick={(e) => handleMarkAsRead(notif, e)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

