import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { auth as authApi } from '../../lib/api.js';

export default function VerifyPhonePage() {
  const { navigate, login, showToast, routeQuery } = useApp();
  const phone = routeQuery?.get('phone') || '';
  const purpose = routeQuery?.get('purpose') || 'login';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!phone) {
      navigate(purpose === 'register' ? '/register' : '/login');
      return;
    }
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    // Auto-submit when all 6 digits entered
    if (next.every(d => d) && value) handleVerify(next.join(''));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split('');
      setCode(next);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeStr = code.join('')) => {
    if (codeStr.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.verifyOtp(phone, codeStr, purpose);
      login(data.user);
      if (data.isNewUser || !data.user.onboarding_completed_at) {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    try {
      await authApi.sendOtp(phone, purpose);
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      showToast('New code sent to your phone.', 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const maskedPhone = phone
    ? phone.replace(/(\+\d{3})\d+(\d{4})/, '$1****$2')
    : '';

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#FFC900] selection:text-[#10271B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2.5 cursor-pointer mb-8 group"
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

        {/* Phone icon */}
        <div className="w-16 h-16 rounded-full bg-[#003D37]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#003D37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#10271B]">Check your phone</h2>
        <p className="mt-2 text-sm text-slate-500">
          We sent a 6-digit code to <span className="font-semibold text-[#003D37]">{maskedPhone}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-sm rounded-2xl border border-slate-100 sm:px-10">

          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm text-center">
              {error}
            </div>
          )}

          {/* OTP input boxes */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none
                  ${digit ? 'border-[#003D37] bg-[#003D37]/5 text-[#003D37]' : 'border-slate-200 text-slate-800'}
                  focus:border-[#FFC900] focus:ring-2 focus:ring-[#FFC900]/30`}
                disabled={loading}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || code.some(d => !d)}
            className="w-full py-3.5 px-4 bg-[#003D37] text-white font-semibold rounded-xl hover:bg-[#003D37]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying…
              </>
            ) : 'Verify & Continue'}
          </button>

          <div className="mt-6 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-slate-500">
                Resend code in <span className="font-semibold text-[#003D37]">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm font-semibold text-[#003D37] hover:text-[#FFC900] transition-colors disabled:opacity-50"
              >
                {resendLoading ? 'Sending…' : 'Resend verification code'}
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(purpose === 'register' ? '/register' : '/login')}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Use a different number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
