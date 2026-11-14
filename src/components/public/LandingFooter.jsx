import React from 'react';
import { useApp } from '../../context/AppContext';

export default function LandingFooter() {
  const { navigate } = useApp();

  return (
    <footer className="bg-[#003D37] text-[#E4EFDF] border-t border-[#002B27] pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & Mission column */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center space-x-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 flex items-center justify-center text-[#FFC900] group-hover:rotate-45 transition duration-300">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                Terra<span className="text-[#FFC900]">Tills</span>
              </span>
            </div>

            <p className="text-[#E4EFDF]/80 text-xs leading-relaxed max-w-sm">
              Nigeria’s unified marketplace connecting farmland leasing, machinery rentals, certified labour crews, and agricultural training under transparent digital agreements.
            </p>

            <div className="pt-2 text-[#E4EFDF]/70 space-y-1.5">
              <p>✉️ Direct Inquiries: <span className="text-white font-semibold">support@terratills.com</span></p>
            </div>
          </div>

          {/* Quick Links: Services */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5 text-[#E4EFDF]/80">
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-[#FFC900] transition">
                  Farmland Leasing
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-[#FFC900] transition">
                  Machinery & Tractors
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-[#FFC900] transition">
                  Farm Labour Crews
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-[#FFC900] transition">
                  Agronomy Workshops
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard/explore')} className="hover:text-[#FFC900] font-bold text-[#559B45] transition flex items-center space-x-1">
                  <span>Browse All Listings</span>
                  <span>→</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Architecture */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-[#E4EFDF]/80">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#FFC900] transition">
                  About TerraTills
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pricing')} className="hover:text-[#FFC900] transition">
                  Pricing & 5% Fee Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#FFC900] transition">
                  Verification Standards
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pricing')} className="hover:text-[#FFC900] transition">
                  Bach Payment Adapter
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-[#FFC900] transition">
                  Unified Account System
                </button>
              </li>
            </ul>
          </div>

          {/* Account & Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Get Started</h4>
            <ul className="space-y-2.5 text-[#E4EFDF]/80">
              <li>
                <button onClick={() => navigate('/signup')} className="text-[#FFC900] font-bold hover:underline">
                  Create Unified Account
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-[#FFC900] transition">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/forgot-password')} className="hover:text-[#FFC900] transition">
                  Reset Password
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-[#FFC900] transition">
                  Contact Support Desk
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard/assistant')} className="text-[#559B45] font-semibold hover:text-[#FFC900] transition flex items-center space-x-1">
                  <span>🤖</span> <span>Ask Agro AI</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#E4EFDF]/60">
          <p>© {new Date().getFullYear()} TerraTills Technologies Ltd. All rights reserved. Nigeria-First Agricultural Services Marketplace.</p>
          <div className="flex items-center space-x-6">
            <span>Non-Escrow Compliance</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
