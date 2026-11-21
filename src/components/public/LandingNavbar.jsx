import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function LandingNavbar() {
  const { currentRoute, navigate, currentUser, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return currentRoute === '/' || currentRoute === '/home';
    return currentRoute === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E4EFDF] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo: Charcoal #10271B / Deep Teal #003D37 + Green #559B45 */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
        >
          {/* Starburst geometric icon in Deep Teal #003D37 */}
          <div className="w-8 h-8 flex items-center justify-center text-[#003D37] group-hover:rotate-45 transition duration-300">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#10271B] font-sans">
            Terra<span className="text-[#559B45]">Tills</span>
          </span>
        </div>

        {/* Center Floating Pill Navigation: Soft Sage border/bg, Deep Teal active */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#E4EFDF]/50 border border-[#E4EFDF] p-1.5 rounded-full shadow-xs">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-tight transition duration-200 ${
                  active
                    ? 'bg-[#003D37] text-white shadow-xs'
                    : 'text-[#10271B] hover:text-[#003D37] hover:bg-[#E4EFDF]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          {currentUser && (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs font-bold text-[#10271B] hover:text-[#003D37] transition flex items-center space-x-2"
              >
                {currentUser.avatar && (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name || 'User'} 
                    className="w-6 h-6 rounded-full object-cover border border-[#E4EFDF]" 
                  />
                )}
                <span className="hidden lg:inline">Dashboard</span>
              </button>
              <button
                onClick={logout}
                className="bg-[#E4EFDF] hover:bg-[#d5e7d0] text-[#003D37] font-semibold text-xs px-4 py-2 rounded-full transition"
              >
                Sign Out
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#10271B] hover:text-[#003D37]"
          aria-label="Toggle Navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E4EFDF] px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active ? 'bg-[#003D37] text-white' : 'text-[#10271B] hover:bg-[#E4EFDF]/60'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-[#E4EFDF] flex flex-col space-y-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-bold bg-[#FFC900] text-[#10271B] rounded-xl shadow-xs"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl"
                >
                  Sign Out
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
