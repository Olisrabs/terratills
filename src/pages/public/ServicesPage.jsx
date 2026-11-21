import React, { useState } from 'react';
import { Sprout, Tractor, Users, GraduationCap, Check } from 'lucide-react';
import LandingNavbar from '../../components/public/LandingNavbar';
import LandingFooter from '../../components/public/LandingFooter';
import { useApp } from '../../context/AppContext';

export default function ServicesPage() {
  const { navigate } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    {
      id: 'farmland',
      title: 'Farmland Leasing',
      icon: Sprout,
      badge: 'Verified Parcels',
      heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
      description: 'Access arable, validated agricultural lands for short-term and multi-year leases across Nigeria. Complete with surveyor boundary data and customary approvals.',
      typicalPricing: '₦12,000 – ₦45,000 / hectare / year',
      features: [
        'Boundary GIS coordinates verified',
        'Traditional authority consent confirmed',
        'Soil fertility & water proximity ratings',
        'Standardized agricultural tenancy covenants'
      ]
    },
    {
      id: 'machinery',
      title: 'Machinery & Tractor Rental',
      icon: Tractor,
      badge: 'Certified Fleets',
      heroImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
      description: 'Deploy 55HP to 110HP tractors, combine harvesters, disc ploughs, boom sprayers, and de-stoners on daily or hectare-based rates with vetted operators.',
      typicalPricing: '₦45,000 – ₦85,000 / day',
      features: [
        'Mechanic inspection certified prior to dispatch',
        'Trained professional operator included',
        'Logistics & flatbed mobilization tracking',
        'Fuel and breakdown contingency protocol'
      ]
    },
    {
      id: 'labour',
      title: 'Farm Labour Crews',
      icon: Users,
      badge: 'Organized Squads',
      heroImage: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800',
      description: 'Hire organized 5 to 20-person crews for land preparation, manual weeding, cassava uprooting, yam ridge moulding, and grain harvesting on structured terms.',
      typicalPricing: '₦35,000 – ₦65,000 / crew / day',
      features: [
        'Lead foreman responsible for squad performance',
        'Standardized daily output agreements',
        'Safe accommodation & feeding arrangements clear',
        'Dual-signoff upon daily task inspection'
      ]
    },
    {
      id: 'training',
      title: 'Agronomy Training & Tutorials',
      icon: GraduationCap,
      badge: 'Field Masterclasses',
      heroImage: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=800',
      description: 'Field-tested practical agricultural tutorials and hands-on masterclasses covering export commodity handling, soil amendment, drip irrigation, and post-harvest preservation.',
      typicalPricing: '₦15,000 – ₦50,000 / masterclass',
      features: [
        'Accredited agronomists and soil scientists',
        'Practical on-farm demonstrations',
        'Resource manuals and seed calculation templates',
        'Direct certification on platform profile'
      ]
    }
  ];

  const filteredCategories = activeCategory === 'all' 
    ? categories 
    : categories.filter(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-white text-[#10271B] font-sans selection:bg-[#FFC900] selection:text-[#10271B]">
      <LandingNavbar />

      <main className="space-y-20 md:space-y-28 pb-24">
        {/* Header Hero */}
        <section className="pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-[#003D37] uppercase mb-4 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#559B45]" />
            <span>Marketplace Directory</span>
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#003D37] max-w-4xl mx-auto leading-tight mb-6">
            Four core agricultural verticals. One trusted standard.
          </h1>
          <p className="text-xs sm:text-sm text-[#10271B]/80 max-w-2xl mx-auto leading-relaxed font-medium">
            All categories on TerraTills are backed by verified provider identities, objective inspection standards, and secure server-verified settlements.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { id: 'all', label: 'All Services', icon: null },
              { id: 'farmland', label: 'Farmland', icon: Sprout },
              { id: 'machinery', label: 'Machinery', icon: Tractor },
              { id: 'labour', label: 'Labour Crews', icon: Users },
              { id: 'training', label: 'Training', icon: GraduationCap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1.5 ${
                  activeCategory === tab.id
                    ? 'bg-[#003D37] text-white'
                    : 'bg-[#E4EFDF]/70 text-[#10271B] hover:bg-[#E4EFDF]'
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Detailed Service Cards Grid */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCategories.map((cat) => (
              <div 
                key={cat.id}
                className="bg-white rounded-3xl border border-[#E4EFDF] p-6 sm:p-8 shadow-card flex flex-col justify-between hover:border-[#559B45]/50 transition duration-300"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-6 bg-[#E4EFDF]">
                    <img 
                      src={cat.heroImage} 
                      alt={cat.title} 
                      className="w-full h-full object-cover" 
                    />
                    <span className="absolute top-3 left-3 bg-[#FFC900] text-[#10271B] text-[11px] font-black px-3 py-1 rounded-full shadow-xs">
                      {cat.badge}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#E4EFDF] flex items-center justify-center text-[#003D37]">
                      <cat.icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#003D37]">{cat.title}</h3>
                  </div>

                  <p className="text-xs text-[#10271B]/80 leading-relaxed mt-2 mb-4 font-medium">
                    {cat.description}
                  </p>

                  <div className="bg-[#E4EFDF]/40 rounded-2xl p-4 border border-[#E4EFDF] mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#003D37] block mb-1">
                      Benchmark Rates
                    </span>
                    <span className="text-sm font-extrabold text-[#003D37]">
                      {cat.typicalPricing}
                    </span>
                  </div>

                  <div className="space-y-2 mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#559B45] block">
                      Platform Verification Standards
                    </span>
                    <ul className="space-y-2">
                      {cat.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-[#10271B]/80 font-medium">
                          <Check className="w-3.5 h-3.5 text-[#559B45] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4EFDF] flex items-center justify-between">
                  <button
                    onClick={() => navigate('/dashboard/explore')}
                    className="text-xs font-bold text-[#003D37] hover:underline flex items-center space-x-1"
                  >
                    <span>Browse listings in this category</span>
                    <span className="text-[#559B45]">→</span>
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs px-5 py-2.5 rounded-full transition shadow-xs cursor-pointer"
                  >
                    Book Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-[#003D37] text-white rounded-[36px] p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have farmland, machinery or farm labour to offer?
            </h2>
            <p className="text-xs sm:text-sm text-[#E4EFDF] max-w-lg mx-auto leading-relaxed">
              Use your same unified account to list services, receive verified booking inquiries, and receive secure payouts.
            </p>
            <div>
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full transition shadow-md active:scale-95 cursor-pointer"
              >
                Create Provider Listing
              </button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
