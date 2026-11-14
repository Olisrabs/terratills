import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function MyServices() {
  const { navigate, apiFetch, showToast, currentUser } = useApp();
  const [services, setServices] = useState([]);
  const [counts, setCounts] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      if (selectedCategory) params.set('category', selectedCategory);

      const res = await apiFetch(`/api/services?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load owned services');
      const data = await res.json();
      setServices(data.services || []);
      setCounts(data.counts || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [activeTab, selectedCategory, currentUser]);

  const handleToggleStatus = async (serviceId, currentStatus, e) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await apiFetch(`/api/services/${serviceId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast(`Listing ${newStatus === 'active' ? 'activated' : 'paused'} successfully.`, 'info');
      fetchServices();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const tabs = [
    { key: 'all', label: 'All Listings', count: counts.all || 0 },
    { key: 'active', label: 'Active', count: counts.active || 0 },
    { key: 'draft', label: 'Draft', count: counts.draft || 0 },
    { key: 'pending_review', label: 'Pending Review', count: counts.pending_review || 0 },
    { key: 'paused', label: 'Paused', count: counts.paused || 0 },
    { key: 'archived', label: 'Archived', count: counts.archived || 0 }
  ];

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(searchTitle.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 px-4 md:px-6 pt-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Service Listings</h1>
          <p className="text-xs text-slate-500">
            Manage your farmland leases, machinery rental units, labour crews, and training tutorials.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/services/new')}
          className="bg-forest hover:bg-forest-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition shadow-xs flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Add New Service</span>
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition rounded-xl flex items-center space-x-1.5 ${
                  isActive ? 'bg-forest text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 rounded-full ${isActive ? 'bg-forest-700 text-white' : 'bg-white text-slate-700'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search my listings..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-full px-3 py-1.5 text-slate-700"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-full px-3 py-1.5 text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="farmland">Farmland</option>
            <option value="machinery">Machinery</option>
            <option value="labour">Labour</option>
            <option value="training">Training</option>
          </select>
        </div>
      </div>

      {/* Listings List */}
      {loading ? (
        <LoadingView message="Loading your service inventory..." />
      ) : error ? (
        <ErrorView error={error} onRetry={fetchServices} />
      ) : filteredServices.length === 0 ? (
        <EmptyView
          icon="📦"
          title="No services in this group"
          description="Start offering agricultural services to earn income across Nigeria."
          actionLabel="Add Your First Service"
          onAction={() => navigate('/dashboard/services/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(`/dashboard/services/${service.id}`)}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-card hover:border-emerald-200 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex space-x-3.5 mb-3">
                  <img
                    src={service.cover_image}
                    alt={service.title}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-md">
                        {service.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                        service.status === 'active' ? 'bg-emerald-100 text-forest' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {service.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{service.title}</h3>
                    <p className="text-xs font-black text-forest mt-1">
                      ₦{service.price.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/ {service.pricing_unit}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      📍 {service.location?.town}, {service.location?.state} State
                    </p>
                  </div>
                </div>

                {/* Performance Mini Bar */}
                <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50/80 rounded-xl text-center text-xs mb-3">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Views</span>
                    <span className="font-bold text-slate-800">{service.views_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Enquiries</span>
                    <span className="font-bold text-slate-800">{service.enquiry_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Impressions</span>
                    <span className="font-bold text-slate-800">{service.search_impressions || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/services/${service.id}/edit`);
                    }}
                    className="text-slate-600 hover:text-forest font-semibold"
                  >
                    Edit
                  </button>
                  <span>•</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/services/${service.id}/availability`);
                    }}
                    className="text-slate-600 hover:text-forest font-semibold"
                  >
                    Availability
                  </button>
                  <span>•</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/services/${service.id}/performance`);
                    }}
                    className="text-slate-600 hover:text-forest font-semibold"
                  >
                    Performance
                  </button>
                </div>

                <button
                  onClick={(e) => handleToggleStatus(service.id, service.status, e)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full transition ${
                    service.status === 'active'
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {service.status === 'active' ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

