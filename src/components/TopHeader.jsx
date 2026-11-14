import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function TopHeader() {
  const { currentUser, navigate, unreadNotifCount } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/dashboard/explore/search', { q: searchQuery.trim() });
    }
  };

  return (
    <header className="hidden md:flex sticky top-0 z-30 bg-[#003D37] text-white px-4 md:px-6 py-2.5 shadow-md items-center justify-between">
      {/* Center: Search input pill */}
      <div className="flex-1 max-w-md mr-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#E4EFDF]/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" strokeLinecap="round"></circle>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"></path>
            </svg>
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#002B27] text-white placeholder-[#E4EFDF]/60 text-xs rounded-full pl-9 pr-9 py-2 border border-[#004D45] focus:outline-none focus:ring-2 focus:ring-[#FFC900] transition"
            placeholder="Search farmland, tractors, farm labour, agronomy..."
            type="text"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#E4EFDF]/80 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Right: Actions, Notifications & Profile Avatar */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* AI Assistant shortcut */}
        <button
          onClick={() => navigate('/dashboard/assistant')}
          className="flex items-center space-x-1 bg-[#002B27] hover:bg-[#004D45] text-[#FFC900] hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition border border-[#004D45] cursor-pointer"
          title="AI Agricultural Assistant"
        >
          <span>🤖</span>
          <span className="hidden md:inline">Agro AI</span>
        </button>

        {/* Notifications Icon with Unread Pill */}
        <button
          onClick={() => navigate('/dashboard/notifications')}
          className="relative p-2 rounded-full text-[#E4EFDF] hover:text-white hover:bg-[#002B27] transition cursor-pointer"
          title="Notifications"
        >
          <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadNotifCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FFC900] rounded-full ring-2 ring-[#003D37]"></span>
          )}
        </button>

        {/* Profile Avatar — click navigates to profile page (no dropdown) */}
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="flex items-center cursor-pointer"
          title="My Profile"
        >
          <div className="w-9 h-9 rounded-full border-2 border-[#FFC900]/70 overflow-hidden bg-[#002B27] flex items-center justify-center">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
              alt={currentUser?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  );
}
