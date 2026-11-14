import React from 'react';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav() {
  const { currentRoute, navigate } = useApp();

  const tabs = [
    { label: 'Home', path: '/dashboard', icon: 'Home' },
    { label: 'Explore', path: '/dashboard/explore', icon: 'Explore' },
    { label: 'Bookings', path: '/dashboard/bookings', icon: 'Bookings' },
    { label: 'Services', path: '/dashboard/services', icon: 'Services' },
    { label: 'Messages', path: '/dashboard/messages', icon: 'Messages' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') return currentRoute === '/dashboard';
    return currentRoute.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 shadow-nav px-4 pt-2 pb-1 z-30">
      <div className="flex justify-between items-center text-[10px] font-medium">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center flex-1 py-0.5 transition group ${
                active ? 'text-forest font-bold' : 'text-slate-400 hover:text-forest'
              }`}
            >
              <div className="p-1 rounded-full group-hover:scale-105 transition">
                {tab.icon === 'Home' && (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                )}
                {tab.icon === 'Explore' && (
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="1.8" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"></circle>
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round"></path>
                  </svg>
                )}
                {tab.icon === 'Bookings' && (
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )}
                {tab.icon === 'Services' && (
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="1.8" viewBox="0 0 24 24">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                )}
                {tab.icon === 'Messages' && (
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                )}
              </div>
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* iOS Home Indicator Pill */}
      <div className="w-28 h-1 bg-slate-900 rounded-full mx-auto mt-1 mb-0.5 opacity-80"></div>
    </nav>
  );
}
