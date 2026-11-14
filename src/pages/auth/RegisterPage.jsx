import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const NIGERIAN_STATES = [
  'Kaduna', 'Kano', 'Oyo', 'Benue', 'Niger', 'Lagos', 'Ogun', 'Plateau',
  'Taraba', 'Bauchi', 'Kwara', 'Edo', 'Delta', 'Enugu', 'Cross River', 'Other'
];

export default function RegisterPage() {
  const { navigate, login } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: 'Kaduna',
    town: '',
    password: '',
    confirmPassword: '',
    agreedTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!formData.agreedTerms) {
      setError('You must accept the Unified Marketplace rules and terms.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          location: {
            state: formData.state,
            lga: formData.town,
            town: formData.town,
            country: 'Nigeria'
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create unified account');

      login(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          Create your Unified Account
        </h2>
        <p className="mt-1 text-xs text-[#10271B]/70 font-medium">
          One identity to hire machinery, lease land, mobilize labour, and offer your own services.
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

          {/* Unified Account Rule Banner */}
          <div className="mb-6 p-3 rounded-2xl bg-[#E4EFDF]/50 border border-[#559B45]/30 text-xs flex items-start space-x-2.5">
            <span className="text-base">🌿</span>
            <div className="text-[11px] text-[#003D37] leading-relaxed">
              <strong>Non-Negotiable Rule:</strong> One account for all roles. You never need separate accounts for farming, machinery, or labour.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#003D37] mb-1">Full Legal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Babatunde Adeleke"
                className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B] font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#003D37] mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="name@company.ng"
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#003D37] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+234 800 000 0000"
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#003D37] mb-1">Primary State</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B]"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#003D37] mb-1">Town / Community</label>
                <input
                  type="text"
                  value={formData.town}
                  onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                  required
                  placeholder="e.g. Zaria, Oyo, Makurdi"
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#003D37] mb-1">Create Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="At least 6 chars"
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#003D37] mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="Repeat password"
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#10271B]/70">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-[#003D37] font-semibold"
              >
                {showPassword ? 'Hide password characters' : 'Show password characters'}
              </button>
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedTerms}
                  onChange={(e) => setFormData({ ...formData, agreedTerms: e.target.checked })}
                  required
                  className="w-4 h-4 mt-0.5 rounded border-[#E4EFDF] text-[#003D37] focus:ring-[#559B45] shrink-0"
                />
                <span className="text-[#10271B]/80 text-xs leading-relaxed font-medium">
                  I agree to the <span className="font-bold text-[#003D37]">TerraTills Marketplace Terms</span>, verified identity standards, and server-side payment clearing protocols.
                </span>
              </label>
            </div>

            {/* Harvest Gold CTA Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs py-3.5 rounded-full transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Creating Unified Account...' : 'Register Unified Account →'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-[#10271B]/70 pt-4 border-t border-[#E4EFDF]">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-[#003D37] hover:underline"
            >
              Sign in here
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
