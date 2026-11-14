import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const { navigate, login, showToast } = useApp();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: emailOrPhone.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign in');

      login(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (email, pass = 'password123') => {
    setEmailOrPhone(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#FFC900] selection:text-[#10271B]">
      
      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div 
          onClick={() => navigate('/')} 
          className="inline-flex items-center space-x-2.5 cursor-pointer mb-4 select-none group"
        >
          <div className="w-9 h-9 flex items-center justify-center text-[#003D37] group-hover:rotate-45 transition duration-300">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#10271B]">
            Terra<span className="text-[#559B45]">Tills</span>
          </span>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-[#003D37]">
          Sign in to your unified account
        </h2>
        <p className="mt-1 text-xs text-[#10271B]/70 font-medium">
          Access your bookings, active listings, and agro services from one place.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-[#E4EFDF]">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#003D37] mb-1">
                Email Address or Phone Number
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                placeholder="e.g. musa.danladi@terratills.ng"
                className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B] font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-[#003D37]">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-[#003D37] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-[#E4EFDF] text-[#003D37] focus:ring-[#559B45]"
                />
                <span className="text-[#10271B]/70 text-xs font-medium">Remember this device</span>
              </label>
            </div>

            {/* Harvest Gold CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs py-3.5 rounded-full transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
              </button>
            </div>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div className="mt-6 pt-6 border-t border-[#E4EFDF]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#003D37] block mb-2 text-center">
              Quick Test Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('musa.danladi@terratills.ng')}
                className="p-2 rounded-xl bg-[#E4EFDF]/40 border border-[#E4EFDF] hover:bg-[#E4EFDF] text-[#003D37] text-left truncate transition cursor-pointer"
                title="Alhaji Musa Danladi (user_1)"
              >
                <span className="font-bold block truncate">🌾 Musa Danladi</span>
                <span className="text-[10px] text-[#10271B]/60 truncate block">Farmland & Tractors</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('adesola.olawale@greenroots.ng')}
                className="p-2 rounded-xl bg-[#E4EFDF]/40 border border-[#E4EFDF] hover:bg-[#E4EFDF] text-[#003D37] text-left truncate transition cursor-pointer"
                title="Adesola Olawale (user_2)"
              >
                <span className="font-bold block truncate">🚜 Adesola Olawale</span>
                <span className="text-[10px] text-[#10271B]/60 truncate block">Commercial Machinery</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#10271B]/70 pt-4 border-t border-[#E4EFDF]">
            Don’t have an account yet?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-bold text-[#003D37] hover:underline"
            >
              Register here
            </button>
          </div>

        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-[#10271B]/70 hover:text-[#003D37] font-semibold"
          >
            ← Back to TerraTills Home
          </button>
        </div>
      </div>

    </div>
  );
}
