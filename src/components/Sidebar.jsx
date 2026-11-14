import React from 'react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentRoute, navigate, currentUser } = useApp();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Explore Services', path: '/dashboard/explore', icon: 'Compass' },
    { label: 'My Bookings', path: '/dashboard/bookings', icon: 'CalendarDays' },
    { label: 'My Services', path: '/dashboard/services', icon: 'Layers' },
    { label: 'Service Requests', path: '/dashboard/service-requests', icon: 'Inbox' },
    { label: 'Messages', path: '/dashboard/messages', icon: 'MessageSquare' },
    { label: 'Verification Centre', path: '/dashboard/verification', icon: 'ShieldCheck' },
    { label: 'AI Agro Assistant', path: '/dashboard/assistant', icon: 'Bot' },
    { label: 'Account Settings', path: '/dashboard/settings', icon: 'Settings' }
  ];

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path) => {
    if (path === '/dashboard') return currentRoute === '/dashboard';
    return currentRoute.startsWith(path);
  };

  const renderIcon = (name) => {
    switch (name) {
      case 'LayoutDashboard':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        );
      case 'Compass':
        return (
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        );
      case 'CalendarDays':
        return (
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'Layers':
        return (
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        );
      case 'Inbox':
        return (
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        );
      case 'MessageSquare':
        return (
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'ShieldCheck':
        return (
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        );
      case 'Bot':
        return (
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        );
      case 'Settings':
      default:
        return (
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container in Deep Teal #003D37 */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#003D37] text-white flex flex-col z-50 md:z-20 transform transition-transform duration-300 ease-in-out border-r border-[#002B27] ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div
              onClick={() => handleNav('/dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FFC900] text-[#10271B] flex items-center justify-center font-black text-sm shadow-card">
                TT
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  Terra<span className="text-[#FFC900]">Tills</span>
                </span>
                <span className="text-[10px] text-[#E4EFDF]/80 font-medium tracking-wide uppercase">
                  Nigeria Marketplace
                </span>
              </div>
            </div>

            {/* Mobile close */}
            <button
              onClick={onClose}
              className="md:hidden text-[#E4EFDF] hover:text-white p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Quick CTA: Add a Service in Harvest Gold #FFC900 */}
          <button
            onClick={() => handleNav('/dashboard/services/new')}
            className="w-full bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] text-xs font-black py-2.5 px-3 rounded-xl transition shadow-card flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>+</span>
            <span>Add a Service</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  active
                    ? 'bg-[#002B27] text-[#FFC900] font-bold shadow-xs border-l-4 border-[#FFC900]'
                    : 'text-[#E4EFDF]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={active ? 'text-[#FFC900]' : 'text-[#559B45]'}>
                    {renderIcon(item.icon)}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Public Website / Landing Page link */}
        <div className="px-3 py-2 border-t border-white/10">
          <button
            onClick={() => handleNav('/')}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#E4EFDF]/80 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <span>← Public Website</span>
            <span>🌐</span>
          </button>
        </div>

        {/* Unified Account Footer Badge */}
        <div className="p-3 border-t border-white/10 bg-[#002B27]">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover border border-[#FFC900]/40"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#559B45] rounded-full border border-[#003D37] text-[7px] flex items-center justify-center">
                🌿
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-[#E4EFDF]/80 truncate">1 Unified Dashboard</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
