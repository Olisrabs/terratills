import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function MyBookings() {
  const { navigate, apiFetch, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all'); // all, customer, provider
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        if (activeTab === 'pending') params.set('status', 'pending_provider_response');
        else if (activeTab === 'awaiting_payment') params.set('status', 'awaiting_payment');
        else if (activeTab === 'active') params.set('status', 'in_progress');
        else if (activeTab === 'completed') params.set('status', 'completed');
        else if (activeTab === 'cancelled') params.set('status', 'cancelled');
        else if (activeTab === 'disputed') params.set('status', 'disputed');
      }
      if (roleFilter !== 'all') {
        params.set('role', roleFilter);
      }

      const res = await apiFetch(`/api/bookings?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
      setCounts(data.counts || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, roleFilter, currentUser]);

  const tabs = [
    { key: 'all', label: 'All Bookings', count: counts.all || 0 },
    { key: 'pending', label: 'Pending Review', count: counts.pending || 0 },
    { key: 'awaiting_payment', label: 'Awaiting Payment', count: counts.awaiting_payment || 0 },
    { key: 'active', label: 'Active / In Progress', count: counts.active || 0 },
    { key: 'completed', label: 'Completed', count: counts.completed || 0 },
    { key: 'disputed', label: 'Disputed', count: counts.disputed || 0 },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled || 0 }
  ];

  return (
    <div className="space-y-6 pb-16 px-4 md:px-6 pt-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500">
            Unified view of all bookings across your account where you are either Customer or Provider.
          </p>
        </div>

        {/* Role perspective selector (Non-negotiable rule 1 & 3) */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              roleFilter === 'all' ? 'bg-white text-forest shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-3 py-1 rounded-lg transition ${
              roleFilter === 'customer' ? 'bg-white text-forest shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Services I Booked (Customer)
          </button>
          <button
            onClick={() => setRoleFilter('provider')}
            className={`px-3 py-1 rounded-lg transition ${
              roleFilter === 'provider' ? 'bg-white text-forest shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Services I Provided (Provider)
          </button>
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border-b-2 flex items-center space-x-1.5 ${
                isActive
                  ? 'border-forest text-forest font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-forest-50 text-forest' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search / Filter by Category — single straight line */}
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Category:</span>
        {[
          { key: 'all', label: 'All Categories' },
          { key: 'farmland', label: '🌾 Farmland' },
          { key: 'machinery', label: '🚜 Machinery' },
          { key: 'labour', label: '👥 Labour' },
          { key: 'training', label: '🎓 Training' },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-3 py-1.5 rounded-full font-semibold transition shrink-0 whitespace-nowrap ${
              categoryFilter === cat.key
                ? 'bg-forest text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Bookings List Content */}
      {loading ? (
        <LoadingView message="Loading your bookings and contract states..." />
      ) : error ? (
        <ErrorView error={error} onRetry={fetchBookings} />
      ) : bookings.filter(b => categoryFilter === 'all' || b.category === categoryFilter).length === 0 ? (
        <EmptyView
          icon="📅"
          title="No bookings in this group"
          description="Explore available agricultural services or list your own farmland, machinery, labour, or workshops."
          actionLabel="Explore Services"
          onAction={() => navigate('/dashboard/explore')}
        />
      ) : (
        <div className="space-y-3">
          {bookings
            .filter((b) => categoryFilter === 'all' || b.category === categoryFilter)
            .map((booking) => {
            const isCustomer = booking.customer_id === currentUser?.id;
            const otherParticipantName = isCustomer ? booking.provider_name : booking.customer_name;

            return (
              <div
                key={booking.id}
                onClick={() =>
                  navigate(`/dashboard/bookings/${booking.id}`)}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-card hover:border-emerald-200 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest flex items-center justify-center font-bold text-lg shrink-0">
                    {booking.category === 'farmland' ? '🌾' : booking.category === 'machinery' ? '🚜' : booking.category === 'labour' ? '👥' : '🎓'}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-extrabold text-slate-900">{booking.reference}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCustomer ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isCustomer ? 'Role: Customer' : 'Role: Service Provider'}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {booking.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{booking.listing_title}</h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {isCustomer ? 'Provider' : 'Customer'}: <span className="font-semibold text-slate-800">{otherParticipantName}</span> • Dates: <span className="font-medium text-slate-700">{booking.scheduled_dates?.start}</span>
                    </p>
                  </div>
                </div>

                {/* Right State & Actions */}
                <div className="flex items-center md:flex-col md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 font-semibold uppercase block">Amount</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ₦{booking.amount_breakdown?.total_amount?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col items-end space-y-1.5 mt-2">
                    <StatusBadge type="booking" status={booking.status} />
                    <StatusBadge type="payment" status={booking.payment_status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

