import React from 'react';
import { useApp } from '../context/AppContext';

/**
 * MobilePageHeader — shown only on mobile (md:hidden).
 * Renders a back button + page title in Deep Teal #003D37 matching the desktop TopHeader.
 * Usage: <MobilePageHeader title="My Bookings" />
 * Optional: backPath prop to override the back destination (defaults to history.back()).
 */
export default function MobilePageHeader({ title, backPath }) {
  const { navigate } = useApp();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[#003D37] text-white px-4 py-3 flex items-center space-x-3 shadow-md">
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition flex-shrink-0 cursor-pointer"
        aria-label="Go back"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="text-sm font-bold tracking-tight truncate">{title}</h1>
    </header>
  );
}
