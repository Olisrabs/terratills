import React from 'react';
import { UserCheck, Lock, ShieldCheck, Handshake } from 'lucide-react';
import LandingNavbar from '../../components/public/LandingNavbar';
import LandingFooter from '../../components/public/LandingFooter';
import { useApp } from '../../context/AppContext';

export default function AboutPage() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-white text-[#10271B] font-sans selection:bg-[#FFC900] selection:text-[#10271B]">
      <LandingNavbar />

      <main className="space-y-24 md:space-y-32 pb-24">
        {/* Header Hero */}
        <section className="pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-[#003D37] uppercase mb-4 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#559B45]" />
            <span>Our Purpose & Architecture</span>
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#003D37] max-w-4xl mx-auto leading-tight mb-6">
            Pioneering transparent agricultural infrastructure for Nigeria
          </h1>
          <p className="text-xs sm:text-sm text-[#10271B]/80 max-w-2xl mx-auto leading-relaxed font-medium">
            TerraTills was founded to eliminate the acute mechanization deficit and land fragmentation that hinders Nigerian agricultural productivity.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/services')}
              className="bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full transition shadow-md active:scale-95 cursor-pointer"
            >
              Explore Our Services
            </button>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-[#559B45] uppercase tracking-widest block">
                The Problem & Vision
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#003D37] leading-snug">
                Moving from informal, disputed agreements to verifiable digital commerce.
              </h2>
              <p className="text-xs sm:text-sm text-[#10271B]/80 leading-relaxed font-medium">
                For decades, commercial farming in Nigeria suffered from fraudulent land brokerage, unavailable machinery during critical planting windows, and unreliable labour mobilization. 
              </p>
              <p className="text-xs sm:text-sm text-[#10271B]/80 leading-relaxed font-medium">
                TerraTills introduces rigorous, non-negotiable standards: every land parcel is validated with boundary checks, machinery fleets operate with certified operators, and funds are cleared through Bach's server-verified rails with milestone confirmation.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-[#E4EFDF] shadow-card border-2 border-[#E4EFDF]">
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1000"
                  alt="Modern tractor working green farmland"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Product Integrity */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#003D37] tracking-tight">
              Our Core Architecture Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Unified Account Model',
                desc: 'One identity allows you to lease land, hire equipment, or offer your own services without conflicting profile switches.',
                icon: UserCheck
              },
              {
                title: 'No Fabricated Escrow',
                desc: 'Payments are handled transparently via Bach with server-side validation. We never simulate financial outcomes.',
                icon: Lock
              },
              {
                title: 'Objective Verification',
                desc: 'Farmland GPS titles, operator certifications, and identity proofs are vetted before listings earn verified status.',
                icon: ShieldCheck
              },
              {
                title: 'Dual Confirmation Clearing',
                desc: 'Both hirer and provider confirm task completion on-site before payout authorization is triggered.',
                icon: Handshake
              }
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-[#E4EFDF] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#E4EFDF]/80 text-[#003D37] flex items-center justify-center mb-4">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#003D37] mb-2">{p.title}</h3>
                  <p className="text-xs text-[#10271B]/70 leading-relaxed font-medium">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-[#003D37] text-white rounded-[36px] p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Join the growing network of verified agricultural leaders
            </h2>
            <p className="text-xs sm:text-sm text-[#E4EFDF] max-w-lg mx-auto leading-relaxed">
              Experience the power of guaranteed machinery mobilization, verified arable acreage, and transparent payment settlement.
            </p>
            <div>
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full transition shadow-md active:scale-95 cursor-pointer"
              >
                Get Started with One Account
              </button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
