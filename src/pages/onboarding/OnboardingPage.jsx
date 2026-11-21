import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { profile as profileApi } from '../../lib/api.js';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara'
];

export default function OnboardingPage() {
  const { currentUser, navigate, showToast, login } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    display_name: currentUser?.display_name || '',
    state: currentUser?.state || '',
    lga: currentUser?.lga || '',
    town: currentUser?.town || '',
    email: currentUser?.email || '',
    terms_accepted: false,
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleFinish = async () => {
    if (!form.terms_accepted) {
      setError('You must accept the Terms & Conditions to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { profile } = await profileApi.completeOnboarding({
        display_name: form.display_name,
        state: form.state,
        lga: form.lga,
        town: form.town,
        email: form.email || null,
        terms_accepted: true,
      });
      // Update context with the new user data
      login({ ...currentUser, ...profile });
      showToast('Welcome to TerraTills!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepValid = () => {
    if (step === 1) return form.display_name.length >= 2 && form.state && form.lga && form.town;
    if (step === 2) return true;
    if (step === 3) return form.terms_accepted;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col font-sans">
      {/* Header */}
      <div className="bg-[#003D37] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /><line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
          </svg>
          <span className="font-bold text-lg">TerraTills</span>
        </div>
        <span className="text-white/60 text-sm">Step {step} of 3</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/20">
        <div
          className="h-full bg-[#FFC900] transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {error && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Profile */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-[#003D37]/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-[#003D37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#10271B]">Set up your profile</h2>
                <p className="text-sm text-slate-500 mt-1">Help others know who they're working with</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#10271B] mb-1">Full name *</label>
                  <input
                    type="text"
                    value={form.display_name}
                    onChange={e => update('display_name', e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003D37]/30 focus:border-[#003D37] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#10271B] mb-1">State *</label>
                  <select
                    value={form.state}
                    onChange={e => update('state', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003D37]/30 focus:border-[#003D37] text-sm bg-white"
                  >
                    <option value="">Select your state</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#10271B] mb-1">LGA *</label>
                    <input
                      type="text"
                      value={form.lga}
                      onChange={e => update('lga', e.target.value)}
                      placeholder="Local Government"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003D37]/30 focus:border-[#003D37] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#10271B] mb-1">Town *</label>
                    <input
                      type="text"
                      value={form.town}
                      onChange={e => update('town', e.target.value)}
                      placeholder="Town / City"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003D37]/30 focus:border-[#003D37] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Optional email */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-[#FFC900]/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-[#003D37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#10271B]">Add your email</h2>
                <p className="text-sm text-slate-500 mt-1">Optional: used for receipts and important updates</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#10271B] mb-1">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="you@example.com (optional)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003D37]/30 focus:border-[#003D37] text-sm"
                />
              </div>

              <div className="mt-6 p-4 bg-[#E4EFDF] rounded-xl">
                <p className="text-sm text-[#003D37] font-medium">What you can do on TerraTills:</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    'Browse & book farmland, machinery, labour and training',
                    'List your own agricultural services',
                    'Communicate securely with providers',
                    'Pay and receive payments through Bach',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#003D37]/80">
                      <span className="text-[#559B45] font-bold mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Terms */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-[#003D37]/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-[#003D37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#10271B]">Almost there!</h2>
                <p className="text-sm text-slate-500 mt-1">Review and accept our terms to get started</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 h-40 overflow-y-auto text-xs text-slate-500 leading-relaxed mb-5">
                <p className="font-semibold text-slate-700 mb-2">TerraTills Terms of Use</p>
                <p>By using TerraTills, you agree to use the platform lawfully, provide accurate information, and not misrepresent your identity or services. All transactions are facilitated by TerraTills and payment is processed through our payment partner. A 5% commission is applied to provider earnings. TerraTills is not liable for disputes between users beyond the platform's mediation process. You must be 18 or older to use this platform. We reserve the right to suspend accounts found violating these terms.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.terms_accepted}
                  onChange={e => update('terms_accepted', e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-[#003D37] rounded"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  I have read and agree to TerraTills{' '}
                  <span className="text-[#003D37] font-semibold">Terms of Use</span> and{' '}
                  <span className="text-[#003D37] font-semibold">Privacy Policy</span>
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!stepValid()}
                className="flex-1 py-3 bg-[#003D37] text-white font-semibold rounded-xl hover:bg-[#003D37]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading || !form.terms_accepted}
                className="flex-1 py-3 bg-[#FFC900] text-[#10271B] font-bold rounded-xl hover:bg-[#FFC900]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Setting up…
                  </>
                ) : 'Get Started'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
