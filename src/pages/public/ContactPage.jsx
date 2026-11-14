import React, { useState } from 'react';
import LandingNavbar from '../../components/public/LandingNavbar';
import LandingFooter from '../../components/public/LandingFooter';
import { useApp } from '../../context/AppContext';

export default function ContactPage() {
  const { showToast } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'general',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      showToast('Thank you! Your inquiry has been routed to our regional agro desk.', 'success');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-white text-[#10271B] font-sans selection:bg-[#FFC900] selection:text-[#10271B]">
      <LandingNavbar />

      <main className="space-y-20 md:space-y-28 pb-24">
        {/* Header Hero */}
        <section className="pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-[#003D37] uppercase mb-4 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#559B45]" />
            <span>Support & Operations</span>
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#003D37] max-w-4xl mx-auto leading-tight mb-6">
            Get in touch with our agricultural field desks
          </h1>
          <p className="text-xs sm:text-sm text-[#10271B]/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Whether you need assistance with fleet mobilization, farmland verification, or commercial partnerships, our regional teams are active across Nigeria.
          </p>
        </section>

        {/* Contact Form & Regional Hubs Grid */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-7 bg-[#E4EFDF]/40 rounded-3xl p-6 sm:p-10 border border-[#E4EFDF] shadow-xs">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#FFC900] text-[#10271B] rounded-full flex items-center justify-center mx-auto text-2xl shadow-xs font-bold">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold text-[#003D37]">Inquiry Received</h3>
                  <p className="text-xs text-[#10271B]/80 max-w-md mx-auto leading-relaxed font-medium">
                    A regional desk officer will review your request and contact you via phone or email within 2 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', topic: 'general', message: '' });
                    }}
                    className="text-xs font-bold text-[#003D37] hover:underline pt-2 block mx-auto"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-bold text-[#003D37] mb-2">Send an Operational Inquiry</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#003D37] mb-1.5">Your Full Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Babatunde Adeyemi"
                        className="w-full bg-white border border-[#E4EFDF] rounded-2xl px-4 py-3 text-xs text-[#10271B] focus:outline-none focus:ring-2 focus:ring-[#559B45] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#003D37] mb-1.5">Phone Number</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+234 800 000 0000"
                        className="w-full bg-white border border-[#E4EFDF] rounded-2xl px-4 py-3 text-xs text-[#10271B] focus:outline-none focus:ring-2 focus:ring-[#559B45] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#003D37] mb-1.5">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="babatunde@farmenterprise.ng"
                      className="w-full bg-white border border-[#E4EFDF] rounded-2xl px-4 py-3 text-xs text-[#10271B] focus:outline-none focus:ring-2 focus:ring-[#559B45] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#003D37] mb-1.5">Inquiry Department</label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full bg-white border border-[#E4EFDF] rounded-2xl px-4 py-3 text-xs text-[#10271B] focus:outline-none focus:ring-2 focus:ring-[#559B45] transition"
                    >
                      <option value="general">General Marketplace Inquiry</option>
                      <option value="machinery">Tractor Fleet Mobilization & Inspection</option>
                      <option value="farmland">Farmland Title & Boundary Verification</option>
                      <option value="payment">Bach Payment Settlement Support</option>
                      <option value="partnership">Institutional & Cooperatives Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#003D37] mb-1.5">Message / Specification</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please specify location (state/LGA), equipment needed or hectares..."
                      className="w-full bg-white border border-[#E4EFDF] rounded-2xl px-4 py-3 text-xs text-[#10271B] focus:outline-none focus:ring-2 focus:ring-[#559B45] transition"
                    />
                  </div>

                  <button
                    disabled={submitting}
                    type="submit"
                    className="w-full bg-[#FFC900] hover:bg-[#F2BE00] text-[#10271B] font-extrabold text-xs sm:text-sm py-3.5 rounded-full transition shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Transmitting to Regional Desk...' : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </div>

            {/* Regional Hubs & Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4EFDF] shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#003D37]">Field Operations Desk</h3>
                <div className="space-y-3 text-xs text-[#10271B]/80 font-medium">
                  <div className="flex items-start space-x-3">
                    <span className="text-base">📍</span>
                    <div>
                      <strong className="block text-[#003D37]">Northern Agro Corridor</strong>
                      <p>Ali Akilu Road, Kaduna State, Nigeria</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-base">📍</span>
                    <div>
                      <strong className="block text-[#003D37]">Southwest Food Belt</strong>
                      <p>Bodija Agricultural Precinct, Ibadan, Oyo State</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-base">📞</span>
                    <div>
                      <strong className="block text-[#003D37]">Direct Hotline</strong>
                      <p>+234 (0) 800 83772 (Toll-Free, Mon–Sat 7am–7pm)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-base">✉️</span>
                    <div>
                      <strong className="block text-[#003D37]">Email Operations</strong>
                      <p>hello@terratills.ng</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Level Agreement */}
              <div className="bg-[#003D37] text-white rounded-3xl p-6 sm:p-8 shadow-card space-y-3">
                <span className="text-[#FFC900] text-[10px] font-black uppercase tracking-wider block">Commitment</span>
                <h4 className="text-base font-bold">Standard 2-Hour SLA Response</h4>
                <p className="text-xs text-[#E4EFDF] leading-relaxed">
                  During active planting and harvesting windows, tractor requests and operator dispatches are answered with priority escalation.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
