import React, { useState } from 'react';
import { Lightbulb, Eye, Sprout } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LandingNavbar from '../../components/public/LandingNavbar';
import LandingFooter from '../../components/public/LandingFooter';

export default function LandingPage() {
  const { navigate, currentUser } = useApp();
  const [selectedCard, setSelectedCard] = useState(1); // default featured card is Agrivoltaics/Machinery

  const serviceCategories = [
    {
      id: 0,
      title: 'Farmland Leasing',
      slug: 'farmland',
      icon: (
        <svg className="w-5 h-5 text-[#10271B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1M14 10h1M9 14h1M14 14h1M9 18h1M14 18h1" />
        </svg>
      ),
      summary: 'Verified arable hectares across Nigeria with GPS coordinates and customary authority documentation.',
      bgSketch: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 1,
      title: 'Machinery Rental',
      slug: 'machinery',
      icon: (
        <svg className="w-5 h-5 text-[#10271B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <circle cx="7" cy="17" r="3" />
          <circle cx="17" cy="17" r="3" />
          <path d="M10 17h4M7 14h6l2-6H5l-1 6h3M17 14l-1-6" />
        </svg>
      ),
      summary: 'Landowners and farmers who want to maximize yield while hiring modern combine harvesters, planters, and high-horsepower tractors deployed with certified operators.',
      bgSketch: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      title: 'Farm Labour Crews',
      slug: 'labour',
      icon: (
        <svg className="w-5 h-5 text-[#10271B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      summary: 'Organized, vetted teams for planting, weeding, ridging, spraying, and harvest operations on agreed milestone terms.',
      bgSketch: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      title: 'Agro Tutorials & Training',
      slug: 'training',
      icon: (
        <svg className="w-5 h-5 text-[#10271B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
        </svg>
      ),
      summary: 'Practical field masterclasses on greenhouse horticulture, soil pathology, irrigation setup, and commercial grain production.',
      bgSketch: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#10271B] font-sans selection:bg-[#FFC900] selection:text-[#10271B]">
      <LandingNavbar />

      <main className="space-y-24 md:space-y-36 pb-24">
        
        {/* ========================================================= */}
        {/* SECTION 1: HERO SECTION WITH VIVID FLOATING GREEN TOUCH   */}
        {/* ========================================================= */}
        <section className="relative pt-10 md:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
          
          {/* Ambient Botanical Green Atmosphere Wash */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-[#E4EFDF]/70 via-[#E4EFDF]/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-12 left-1/3 -translate-x-1/2 w-[550px] h-[320px] bg-gradient-to-r from-[#559B45]/20 via-[#E4EFDF]/40 to-[#559B45]/15 rounded-full blur-2xl pointer-events-none animate-pulse-glow -z-10" />
          <div className="absolute top-28 right-1/4 w-72 h-72 bg-[#559B45]/15 rounded-full blur-2xl pointer-events-none animate-pulse-glow -z-10" />

          {/* ===================================================== */}
          {/* FLOATING GREEN BOTANICAL ELEMENTS & LIVE PILLS        */}
          {/* ===================================================== */}
          
          {/* 1. Top-Left: Floating Leaf Branch SVG in Vibrant Green #559B45 */}
          <div className="absolute top-6 left-4 sm:left-12 lg:left-20 text-[#559B45] drop-shadow-md pointer-events-none animate-float-slow z-0">
            <svg className="w-10 h-10 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75V9c3.5-1.5 7-1.5 8-1z" />
            </svg>
          </div>

          {/* 2. Top-Right: Floating Wheat & Grain Frond in Green #559B45 */}
          <div className="absolute top-8 right-4 sm:right-14 lg:right-24 text-[#559B45] drop-shadow-md pointer-events-none animate-float-reverse z-0">
            <svg className="w-11 h-11 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>

          {/* 3. Mid-Left: Floating Sprout Stem in Green #559B45 */}
          <div className="absolute top-44 left-2 sm:left-8 lg:left-14 text-[#559B45] pointer-events-none animate-float-sway z-0">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22v-9" />
              <path d="M9 10a5 5 0 0 1 5-5h2v2a5 5 0 0 1-5 5H9z" />
              <path d="M15 13a5 5 0 0 0-5-5H8v2a5 5 0 0 0 5 5h2z" />
            </svg>
          </div>

          {/* 4. Mid-Right: Drifting Botanical Leaf in Deep Teal #003D37 & Green #559B45 */}
          <div className="absolute top-48 right-2 sm:right-10 lg:right-16 text-[#003D37] opacity-85 pointer-events-none animate-float-drift z-0">
            <svg className="w-9 h-9 sm:w-12 sm:h-12 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="4" fill="#559B45" fillOpacity="0.25" />
              <path strokeLinecap="round" d="M12 2v3m0 14v3M4.93 4.93l2.12 2.12m9.9 9.9l2.12 2.12M2 12h3m14 0h3M4.93 19.07l2.12-2.12m9.9-9.9l2.12-2.12" />
            </svg>
          </div>

          {/* ===================================================== */}
          {/* HERO CONTENT AREA                                     */}
          {/* ===================================================== */}

          {/* Large Display Heading in Deep Teal #003D37 with Green #559B45 accent */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#003D37] max-w-4xl mx-auto leading-[1.08] mb-8 relative z-10">
            Building{' '}
            <span className="text-[#559B45] relative inline-block">
              greener
              {/* Organic curved underline */}
              <svg className="absolute -bottom-1.5 left-0 w-full text-[#559B45]/50 overflow-visible" height="6" viewBox="0 0 100 6" fill="none">
                <path d="M0 3C30 0 70 0 100 3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>{' '}
            future for everyone
          </h1>

          {/* Harvest Gold #FFC900 Pill CTA button */}
          <div className="flex justify-center mb-12 relative z-10">
            <button
              onClick={() => navigate(currentUser ? '/dashboard' : '/signup')}
              className="bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs sm:text-sm px-9 py-4 rounded-full transition shadow-md hover:shadow-lg transform active:scale-95 cursor-pointer flex items-center space-x-2.5"
            >
              <span>Let's Create Initiative</span>
              <span className="w-5 h-5 rounded-full bg-[#10271B] text-[#FFC900] flex items-center justify-center text-xs font-black">
                →
              </span>
            </button>
          </div>

          {/* Flanking Sub-info (Left blurb & Right contact) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-xs mb-8 max-w-6xl mx-auto px-2 relative z-10">
            <div>
              <p className="max-w-xs leading-relaxed text-[#10271B]/80 font-medium">
                TerraTills helps farming organizations and communities adopt verified agricultural services that increase harvest yield.
              </p>
            </div>
            <div className="md:text-right">
              <span className="text-[11px] font-bold text-[#003D37] block uppercase tracking-wider mb-0.5">Contact Info</span>
              <p className="text-[#10271B] font-medium">Email: <a href="mailto:hello@terratills.com" className="hover:underline text-[#003D37] font-semibold">hello@terratills.com</a></p>
              <p className="text-[#10271B] font-medium">Phone: <span className="font-semibold">+234 (0) 800 83772</span></p>
            </div>
          </div>

          {/* Minimal line icons above landscape matching reference image */}
          <div className="flex justify-between max-w-4xl mx-auto px-8 mb-2 text-[#003D37] text-sm relative z-10">
            <Lightbulb className="w-4 h-4 opacity-70" />
            <Eye className="w-4 h-4 opacity-70" />
          </div>

          {/* Hero Panorama Landscape Banner with Green Border & Aura */}
          <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(85,155,69,0.22)] border-2 border-[#E4EFDF] max-w-6xl mx-auto h-64 sm:h-80 md:h-96 lg:h-[430px] bg-[#003D37] group z-10">
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=85&w=1800"
              alt="Lush green undulating Nigerian farmlands panorama"
              className="w-full h-full object-cover object-center group-hover:scale-103 transition duration-700 ease-out"
            />
            {/* Ambient green vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#003D37]/70 via-transparent to-transparent pointer-events-none" />
            
            {/* Status tag on the landscape */}
            <div className="absolute bottom-5 left-6 text-white text-xs font-semibold bg-[#003D37]/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#559B45] animate-pulse" />
              <span>Verified Farmlands & Mechanization Network</span>
            </div>

            <div className="absolute bottom-5 right-6 hidden sm:flex items-center space-x-1.5 text-xs font-bold text-[#10271B] bg-[#FFC900] px-3.5 py-1.5 rounded-full shadow-sm">
              <Sprout className="w-3.5 h-3.5 text-[#003D37]" />
              <span>36 Nigerian States</span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: ABOUT & IMPACT METRICS                         */}
        {/* ========================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            
            {/* Left Column: Label in Deep Teal #003D37 */}
            <div className="lg:col-span-2">
              <span className="text-xs font-black text-[#003D37] uppercase tracking-widest block pt-2">
                About
              </span>
            </div>

            {/* Right Column: Statement, Metrics & Feature split */}
            <div className="lg:col-span-10 space-y-12">
              
              {/* Bold Headline Statement in Deep Teal #003D37 */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#003D37] leading-snug max-w-3xl">
                We create sustainable value by understanding your environmental goals and applying our expertise in green innovation and responsible implementation.
              </h2>

              {/* Two Big Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2 pb-6 border-b border-[#E4EFDF]">
                <div>
                  <span className="block text-4xl sm:text-5xl font-extrabold text-[#003D37] tracking-tight">
                    90%
                  </span>
                  <p className="text-xs text-[#10271B]/70 mt-2 leading-relaxed max-w-xs font-medium">
                    Organizations reduce environmental and operational delays after implementing TerraTills sustainability and mechanized strategies.
                  </p>
                </div>
                <div>
                  <span className="block text-4xl sm:text-5xl font-extrabold text-[#003D37] tracking-tight">
                    75K
                  </span>
                  <p className="text-xs text-[#10271B]/70 mt-2 leading-relaxed max-w-xs font-medium">
                    Green initiatives and verified agro service contracts successfully supported across Nigerian agrarian corridors today.
                  </p>
                </div>
              </div>

              {/* Two Column Feature Split below metrics */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                {/* Left Thumbnail with rounded corners */}
                <div className="md:col-span-5">
                  <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-[#E4EFDF] shadow-sm border border-[#E4EFDF] group">
                    <img
                      src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800"
                      alt="Modern agricultural mechanization and sustainability tech"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                </div>

                {/* Right Explanation with Bullet Points & Deep Teal Pill Button */}
                <div className="md:col-span-7 space-y-6">
                  <p className="text-xs sm:text-sm text-[#10271B]/80 leading-relaxed font-medium">
                    We help agricultural organizations transition toward high-yield sustainable operations by providing expert guidance in land access, mechanization planning, and long-term impact solutions.
                  </p>

                  <ul className="space-y-2.5 text-xs text-[#10271B] font-medium">
                    <li className="flex items-center space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#559B45] shrink-0" />
                      <span>Proven sustainability solutions across multiple crop value chains</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#559B45] shrink-0" />
                      <span>Certified verification for tractor fleets, farmland titles, and skilled labour</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#559B45] shrink-0" />
                      <span>Automated milestone clearing and dual-confirmation contract protection</span>
                    </li>
                  </ul>

                  <div>
                    <button
                      onClick={() => navigate('/about')}
                      className="bg-[#003D37] hover:bg-[#002B27] text-white font-bold text-xs px-7 py-3 rounded-full transition shadow-xs cursor-pointer"
                    >
                      Explore Our Impact
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: THE BRIGHT CHOICE / INTERACTIVE SERVICE CARDS   */}
        {/* ========================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Section Heading matching reference design */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#003D37] leading-tight">
              The bright choice for a sustainable world
            </h2>
          </div>

          {/* 4 Cards in a Row: Harvest Gold #FFC900 square icons, Soft Sage #E4EFDF borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {serviceCategories.map((cat, idx) => {
              const isSelected = selectedCard === idx;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCard(idx)}
                  className={`rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-[#E4EFDF]/40 border-[#559B45] shadow-card ring-2 ring-[#559B45]/20'
                      : 'bg-white border-[#E4EFDF] hover:border-[#559B45]/50 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Harvest Gold Square Icon Badge */}
                    <div className="w-10 h-10 rounded-xl bg-[#FFC900] flex items-center justify-center mb-5 shadow-xs">
                      {cat.icon}
                    </div>

                    {/* Card Title */}
                    <h3 className="text-base font-bold text-[#003D37] mb-2">
                      {cat.title}
                    </h3>

                    {/* Sketch/Render and detailed text for active/featured card */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-[#E4EFDF] animate-fade-in space-y-4">
                        <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-[#E4EFDF]">
                          <img
                            src={cat.bgSketch}
                            alt={cat.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-[#10271B]/80 leading-relaxed font-medium">
                          {cat.summary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Explore link */}
                  <div className="mt-6 pt-4 border-t border-[#E4EFDF] flex items-center justify-between text-xs font-bold text-[#003D37]">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/services');
                      }}
                      className="hover:underline flex items-center space-x-1"
                    >
                      <span>Learn more</span>
                      <span className="text-[#559B45]">→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: BIG STAT / POWERING THE SUSTAINABLE INNOVATION  */}
        {/* ========================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Heading, description, and thumbnail */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#003D37] leading-tight">
                Powering the sustainable innovation
              </h2>

              <p className="text-xs sm:text-sm text-[#10271B]/80 leading-relaxed max-w-md font-medium">
                Through advanced clean energy solutions and environmental initiatives, TerraTills helps agricultural enterprises accelerate their transition toward a more sustainable and responsible future.
              </p>

              {/* Thumbnail image with rounded corners */}
              <div className="pt-2">
                <div className="rounded-3xl overflow-hidden w-48 sm:w-60 aspect-[4/3] bg-[#E4EFDF] shadow-sm border border-[#E4EFDF]">
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600"
                    alt="Aerial view of green agricultural terrain"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Giant Stat display in Deep Teal #003D37 + secondary stats */}
            <div className="lg:col-span-6 space-y-12 lg:pl-8">
              
              {/* Massive Stat in Deep Teal #003D37 */}
              <div>
                <span className="block text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#003D37] tracking-tight">
                  ₦210B+
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#10271B]/60 mt-2">
                  Investment in renewable and mechanized agricultural projects
                </p>
              </div>

              {/* Two secondary stats */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#E4EFDF]">
                <div>
                  <span className="block text-3xl sm:text-4xl font-extrabold text-[#003D37] tracking-tight">
                    18k+
                  </span>
                  <p className="text-xs text-[#10271B]/60 font-medium mt-1">
                    Sustainability Projects Deployed
                  </p>
                </div>
                <div>
                  <span className="block text-3xl sm:text-4xl font-extrabold text-[#003D37] tracking-tight">
                    12k+
                  </span>
                  <p className="text-xs text-[#10271B]/60 font-medium mt-1">
                    Organizations Adopting Green Tech
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: HOW IT WORKS & TRANSPARENCY PRINCIPLES         */}
        {/* ========================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-[#E4EFDF]/50 rounded-[36px] p-8 sm:p-12 md:p-16 border border-[#E4EFDF]">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold text-[#559B45] uppercase tracking-wider block mb-2">
                Operational Framework
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003D37] tracking-tight">
                Unified account. Independent participant roles.
              </h2>
              <p className="text-xs sm:text-sm text-[#10271B]/80 mt-2 leading-relaxed font-medium">
                One login gives you complete access to both hire equipment and list your own agricultural services. We enforce non-negotiable standards of trust and transparency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Discover & Agree',
                  desc: 'Browse verified farmland, tractor fleets, or labour crews. Contact providers and mutually agree on scope, timeline, price, and location before initiating payment.'
                },
                {
                  step: '02',
                  title: 'Bach Server Payment',
                  desc: 'Funds are securely verified server-side through supported Bach APIs. Browser redirects are never accepted as proof of settlement.'
                },
                {
                  step: '03',
                  title: 'Dual Confirmation',
                  desc: 'Work is mobilized. Once both customer and provider inspect and confirm satisfactory execution, final payout eligibility is automatically cleared.'
                }
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl p-6 border border-[#E4EFDF] shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="w-8 h-8 rounded-full bg-[#003D37] text-white font-extrabold text-xs flex items-center justify-center mb-4">
                      {item.step}
                    </span>
                    <h3 className="text-sm font-bold text-[#003D37] mb-2">{item.title}</h3>
                    <p className="text-xs text-[#10271B]/70 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: HIGH-IMPACT FINAL CTA IN DEEP TEAL #003D37     */}
        {/* ========================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-[#003D37] text-white rounded-[36px] p-8 sm:p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-card">
            <div className="max-w-xl space-y-3 z-10">
              <span className="text-[#FFC900] text-xs font-bold uppercase tracking-wider block">
                Start Today
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Ready to transform your agricultural operations?
              </h2>
              <p className="text-xs sm:text-sm text-[#E4EFDF] leading-relaxed">
                Join verified growers, tractor owners, and landholders across 36 Nigerian states on TerraTills.
              </p>
            </div>

            <div className="z-10 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full transition shadow-md active:scale-95 cursor-pointer"
              >
                Create Unified Account
              </button>
              <button
                onClick={() => navigate('/services')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-full transition border border-white/20 cursor-pointer"
              >
                Explore Services
              </button>
            </div>

            {/* Glowing organic accent shape in the background */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#559B45]/25 rounded-full blur-3xl pointer-events-none" />
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
