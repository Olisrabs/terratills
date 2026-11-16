import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { auth as authApi } from '../../lib/api.js';

export default function RegisterPage() {
  const { navigate } = useApp();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.sendOtp(phone.trim(), 'register');
      navigate('/verify-phone', {
        phone: phone.trim(),
        purpose: 'register',
        ...(res?.devCode ? { devCode: res.devCode } : {})
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#FFC900] selection:text-[#10271B]">

      {/* Logo */}
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
          <span onClick={() => navigate('/')} className="font-extrabold text-2xl tracking-tight text-[#10271B]">
            Terra<span className="text-[#559B45]">Tills</span>
          </span>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-[#003D37]">
          Create your account
        </h2>
      </div>

      {/* Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-[#E4EFDF]">

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-[#003D37] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="e.g. 08012345678 or +2348012345678"
                className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B] font-medium"
              />
              <p className="mt-1.5 text-[#10271B]/50 text-[11px]">
                A 6-digit verification code will be sent to this number. Standard SMS rates apply.
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-[#E4EFDF]/50 rounded-xl p-4">
              <p className="font-semibold text-[#003D37] mb-2 text-[11px]">With a TerraTills account you can:</p>
              <ul className="space-y-1">
                {[
                  'Book farmland, machinery, labour & training',
                  'List your agricultural services for hire',
                  'Pay & receive payments securely through Bach',
                  'Get verified by the TerraTills team',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-[11px] text-[#003D37]/80">
                    <span className="text-[#559B45] font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="w-full bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs py-3.5 rounded-full transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending code…
                  </>
                ) : 'Get Verification Code →'}
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
      </div>
    </div>
  );
}
