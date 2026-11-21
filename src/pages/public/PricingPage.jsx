import React from 'react';
import { Check } from 'lucide-react';
import LandingNavbar from '../../components/public/LandingNavbar';
import LandingFooter from '../../components/public/LandingFooter';
import { useApp } from '../../context/AppContext';

export default function PricingPage() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-white text-[#10271B] font-sans selection:bg-[#FFC900] selection:text-[#10271B]">
      <LandingNavbar />

      <main className="space-y-24 md:space-y-32 pb-24">
        {/* Header Hero */}
        <section className="pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-[#003D37] uppercase mb-4 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#559B45]" />
            <span>Transparent Economics</span>
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#003D37] max-w-4xl mx-auto leading-tight mb-6">
            Clear, honest pricing with zero hidden brokerage commissions
          </h1>
          <p className="text-xs sm:text-sm text-[#10271B]/80 max-w-2xl mx-auto leading-relaxed font-medium">
            TerraTills replaces unregulated 15%–30% middleman fees with a single, transparent 5% platform fee dedicated to verification and server-side payment security.
          </p>
        </section>

        {/* Pricing Model Highlight Cards */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Customer Fee */}
            <div className="bg-[#E4EFDF]/40 rounded-3xl p-8 border border-[#E4EFDF] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#003D37] uppercase tracking-wider block mb-2">For Service Hirers</span>
                <h3 className="text-xl font-bold text-[#003D37] mb-1">Customer Price</h3>
                <p className="text-xs text-[#10271B]/60 mb-6 font-medium">Book tractors, farmland, labour, or workshops</p>
                <div className="text-4xl font-black text-[#003D37] tracking-tight mb-4">
                  0% <span className="text-xs font-normal text-[#10271B]/60">added booking markup</span>
                </div>
                <p className="text-xs text-[#10271B]/80 leading-relaxed font-medium">
                  Customers pay exactly the agreed base amount quoted by the provider plus standard logistics (if requested). No hidden fees or surprise surcharges.
                </p>
              </div>
              <div className="pt-6 border-t border-[#E4EFDF] mt-6">
                <span className="text-xs font-bold text-[#559B45] bg-[#559B45]/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Free Account & Search
                </span>
              </div>
            </div>

            {/* Provider Earnings (Featured in Deep Teal #003D37) */}
            <div className="bg-[#003D37] text-white rounded-3xl p-8 shadow-card flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#FFC900] uppercase tracking-wider block">For Service Providers</span>
                  <span className="bg-[#FFC900] text-[#10271B] text-[10px] font-black px-2.5 py-0.5 rounded-full">Standard Tier</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Provider Net Payout</h3>
                <p className="text-xs text-[#E4EFDF]/70 mb-6 font-medium">List farmland, equipment, or workforce</p>
                <div className="text-4xl font-black text-white tracking-tight mb-4">
                  95% <span className="text-xs font-normal text-[#E4EFDF]/70">of gross contract value</span>
                </div>
                <p className="text-xs text-[#E4EFDF] leading-relaxed font-medium">
                  TerraTills retains a 5% marketplace commission upon successful contract completion. This covers KYC validation, fleet inspection badges, and Bach API gateway rails.
                </p>
              </div>
              <div className="pt-6 border-t border-white/15 mt-6 relative z-10">
                <span className="text-xs font-semibold text-[#FFC900] inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Instant Payout to Nigerian Bank Accounts
                </span>
              </div>

              {/* Decorative green glow */}
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#559B45]/20 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Verification & KYC */}
            <div className="bg-[#E4EFDF]/40 rounded-3xl p-8 border border-[#E4EFDF] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#003D37] uppercase tracking-wider block mb-2">Trust & Safety</span>
                <h3 className="text-xl font-bold text-[#003D37] mb-1">Identity & Title Vetting</h3>
                <p className="text-xs text-[#10271B]/60 mb-6 font-medium">Mandatory safety checks</p>
                <div className="text-4xl font-black text-[#003D37] tracking-tight mb-4">
                  Free <span className="text-xs font-normal text-[#10271B]/60">standard level</span>
                </div>
                <p className="text-xs text-[#10271B]/80 leading-relaxed font-medium">
                  Basic NIN/BVN identity validation and phone checks are completely free. Comprehensive deed inspection and mechanic machine badges are subsidized.
                </p>
              </div>
              <div className="pt-6 border-t border-[#E4EFDF] mt-6">
                <span className="text-xs font-bold text-[#559B45] bg-[#559B45]/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Level 2 Identity Standard
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ Table */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003D37] tracking-tight">
              Frequently Asked Financial Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'When is payment collected from the customer?',
                a: 'Payment is collected only after both customer and provider reach explicit agreement on work scope, dates, price, and logistics. A booking inquiry never triggers a charge.'
              },
              {
                q: 'How does settlement through Bach work?',
                a: 'TerraTills integrates directly with Bach payment rails. Payments are validated server-side using secure webhooks. Funds remain securely designated until dual on-site completion sign-off.'
              },
              {
                q: 'Is this legally classified as escrow?',
                a: 'No. In adherence with Nigerian regulatory guidelines, TerraTills provides dual-confirmation payment processing under Bach settlement agreements. We do not use the term escrow unless explicitly supported.'
              },
              {
                q: 'What happens if a tractor breaks down or weather stops work?',
                a: 'Our cancellation and dispute protocols calculate adjusted milestone payouts based on verified hectares completed or reschedule without additional platform penalty.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#E4EFDF] shadow-xs">
                <h3 className="text-sm font-bold text-[#003D37] mb-2">{faq.q}</h3>
                <p className="text-xs text-[#10271B]/80 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-[#003D37] text-white rounded-[36px] p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready for clear, commission-free agricultural commerce?
            </h2>
            <div>
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full transition shadow-md active:scale-95 cursor-pointer"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
