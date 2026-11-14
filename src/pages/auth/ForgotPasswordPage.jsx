import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ForgotPasswordPage() {
  const { navigate, showToast } = useApp();
  const [step, setStep] = useState(1); // 1 = request, 2 = verify & new pass, 3 = success
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: emailOrPhone.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request password reset code');

      showToast(`Verification code sent! (Demo Code: ${data.verificationCode || '849201'})`, 'info');
      setVerificationCode(data.verificationCode || '849201');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: emailOrPhone.trim(),
          code: verificationCode.trim(),
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      showToast('Password updated successfully!', 'success');
      setStep(3);
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
          Reset your password
        </h2>
        <p className="mt-1 text-xs text-[#10271B]/70 max-w-xs mx-auto font-medium">
          {step === 1 && 'Enter your registered email address or phone number to receive a verification code.'}
          {step === 2 && 'Enter the 6-digit code and choose a secure new password for your account.'}
          {step === 3 && 'Your credentials have been updated. You can now access your dashboard.'}
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

          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#003D37] mb-1">
                  Registered Email Address or Phone
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs py-3.5 rounded-full transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending Code...' : 'Send Verification Code →'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#E4EFDF]/60 border border-[#559B45]/30 text-[11px] text-[#003D37] font-medium">
                Enter the code sent to <strong>{emailOrPhone}</strong>. (For demo testing, code is autofilled).
              </div>

              <div>
                <label className="block font-bold text-[#003D37] mb-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  placeholder="849201"
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-sm tracking-widest text-center font-bold text-[#003D37] focus:outline-none focus:ring-2 focus:ring-[#559B45]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#003D37] mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#003D37] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full bg-[#E4EFDF]/30 border border-[#E4EFDF] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#559B45] text-[#10271B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs py-3.5 rounded-full transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Updating Password...' : 'Save New Password & Sign In →'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-[#559B45]/15 text-[#559B45] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-lg font-bold text-[#003D37]">Password Reset Complete</h3>
              <p className="text-xs text-[#10271B]/70 leading-relaxed font-medium">
                Your unified account password has been updated. You can now log into your dashboard.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs py-3.5 rounded-full transition shadow-md cursor-pointer"
                >
                  Go to Login →
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-[#10271B]/70 pt-4 border-t border-[#E4EFDF]">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-[#003D37] hover:underline"
            >
              Back to Sign In
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
