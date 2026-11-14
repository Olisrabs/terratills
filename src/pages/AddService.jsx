import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AddService() {
  const { navigate, apiFetch, showToast, currentUser } = useApp();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [category, setCategory] = useState('farmland');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({
    state: currentUser?.location?.state || 'Kaduna',
    lga: currentUser?.location?.lga || 'Zaria',
    town: currentUser?.location?.town || 'Zaria',
    address_privacy: 'general_area'
  });
  const [price, setPrice] = useState('');
  const [pricingUnit, setPricingUnit] = useState('hectare / year');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800');
  const [attributes, setAttributes] = useState({});
  const [verificationDocName, setVerificationDocName] = useState('');
  const [verificationDeclared, setVerificationDeclared] = useState(false);

  const NIGERIAN_STATES = ['Kaduna', 'Oyo', 'Ogun', 'Benue', 'Plateau', 'Kano', 'Ondo', 'Edo', 'Niger', 'Lagos'];

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    if (cat === 'farmland') setPricingUnit('hectare / year');
    else if (cat === 'machinery') setPricingUnit('day');
    else if (cat === 'labour') setPricingUnit('crew / day');
    else if (cat === 'training') setPricingUnit('participant');
    setStep(2);
  };

  const handleSubmit = async (publishStatus = 'active') => {
    if (!title || !price) {
      showToast('Please provide a title and price.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/services/new', {
        method: 'POST',
        body: JSON.stringify({
          category,
          title,
          description,
          location,
          price: Number(price),
          pricing_unit: pricingUnit,
          attributes,
          gallery: [coverImage],
          status: publishStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create service listing');

      showToast(`Service listing created as ${publishStatus}!`, 'success');
      navigate(`/dashboard/services/${data.service.id}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard/services')}
          className="text-xs text-forest font-semibold hover:underline flex items-center space-x-1 mb-2"
        >
          <span>←</span> <span>Back to My Services</span>
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Create Agricultural Service Listing
        </h1>
        <p className="text-xs text-slate-500">
          List farmland, machinery rentals, field labour, or educational tutorials under your single unified account.
        </p>
      </div>

      {/* Step Navigator */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs font-bold overflow-x-auto no-scrollbar">
        {['1. Category', '2. Basic Info', '3. Specifications', '4. Pricing', '5. Verification Evidence', '6. Preview'].map((label, idx) => (
          <button
            key={idx}
            disabled={idx + 1 > step}
            onClick={() => setStep(idx + 1)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              step === idx + 1
                ? 'bg-forest text-white'
                : step > idx + 1
                ? 'text-forest hover:bg-emerald-50'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Step 1: Choose Service Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { id: 'farmland', title: 'Farmland Leasing', desc: 'Lease arable hectares, dry season irrigation, title verified parcels', icon: '🌾', color: 'emerald' },
              { id: 'machinery', title: 'Machinery Rental', desc: 'Rent tractors, combine harvesters, ploughs, sprayers with operators', icon: '🚜', color: 'blue' },
              { id: 'labour', title: 'Farm Labour', desc: 'Deploy planting crews, yam mounders, cassava harvesting teams', icon: '👥', color: 'amber' },
              { id: 'training', title: 'Agricultural Training', desc: 'Organize greenhouse masterclasses, agronomy workshops, certs', icon: '🎓', color: 'purple' }
            ].map((c) => (
              <div
                key={c.id}
                onClick={() => handleCategorySelect(c.id)}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex space-x-3.5 hover:shadow-card ${
                  category === c.id ? 'border-forest bg-forest-50/60' : 'border-slate-100 hover:border-emerald-200'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-2xl shrink-0">
                  {c.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{c.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: BASIC INFO */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Step 2: Basic Information & Location</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30 Hectares Loam Farmland with River Irrigation"
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-forest"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Comprehensive Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe soil characteristics, machine specifications, worker experience, or training curriculum..."
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-forest"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <select
                value={location.state}
                onChange={(e) => setLocation({ ...location, state: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LGA *</label>
              <input
                type="text"
                value={location.lga}
                onChange={(e) => setLocation({ ...location, lga: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Town / Community *</label>
              <input
                type="text"
                value={location.town}
                onChange={(e) => setLocation({ ...location, town: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                required
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-full"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!title || !description}
              className="bg-forest text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-forest-700 transition disabled:opacity-40"
            >
              Next: Specifications →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CATEGORY ATTRIBUTES */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 capitalize">Step 3: {category} Technical Specifications</h2>

          {category === 'farmland' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Size (Hectares)</label>
                <input
                  type="number"
                  placeholder="25"
                  onChange={(e) => setAttributes({ ...attributes, size: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Soil Type</label>
                <input
                  type="text"
                  placeholder="e.g. Fertile Humus Loam"
                  onChange={(e) => setAttributes({ ...attributes, soil_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Water Source / Irrigation</label>
                <input
                  type="text"
                  placeholder="Perennial River / Borehole point"
                  onChange={(e) => setAttributes({ ...attributes, water_source: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title Verification Document</label>
                <select
                  onChange={(e) => setAttributes({ ...attributes, title_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="Certificate of Occupancy (C of O)">Certificate of Occupancy (C of O)</option>
                  <option value="Governor's Consent">Governor's Consent</option>
                  <option value="Local Govt Gazette / Customary">Local Govt Customary Gazette</option>
                </select>
              </div>
            </div>
          )}

          {category === 'machinery' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Make & Model</label>
                <input
                  type="text"
                  placeholder="e.g. Massey Ferguson 375 (75 HP)"
                  onChange={(e) => setAttributes({ ...attributes, make_model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mechanical Condition</label>
                <input
                  type="text"
                  placeholder="Fully serviced / Hydraulic tested"
                  onChange={(e) => setAttributes({ ...attributes, condition: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operator Deployment</label>
                <select
                  onChange={(e) => setAttributes({ ...attributes, operator_included: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="Certified Operator Included">Certified Operator Included</option>
                  <option value="Dry Rental Only">Dry Rental Only (No Operator)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Implements Included</label>
                <input
                  type="text"
                  placeholder="3-Disc Plough, Offset Harrow"
                  onChange={(e) => setAttributes({ ...attributes, implements_included: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>
          )}

          {category === 'labour' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Crew Size</label>
                <input
                  type="text"
                  placeholder="10 Skilled Labourers + 1 Supervisor"
                  onChange={(e) => setAttributes({ ...attributes, crew_size: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialized Duties</label>
                <input
                  type="text"
                  placeholder="Yam Mounding, Cassava Harvesting, Precision Weeding"
                  onChange={(e) => setAttributes({ ...attributes, work_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>
          )}

          {category === 'training' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Training Duration</label>
                <input
                  type="text"
                  placeholder="5 Days Practical + Digital Modules"
                  onChange={(e) => setAttributes({ ...attributes, duration_days: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certificate Awarded</label>
                <input
                  type="text"
                  placeholder="Accredited TerraTills Agronomy Certificate"
                  onChange={(e) => setAttributes({ ...attributes, certification: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-full"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="bg-forest text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-forest-700 transition"
            >
              Next: Pricing & Cover Image →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PRICING */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Step 4: Pricing & Image Media</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price in Naira (₦) *</label>
              <input
                type="number"
                min="1000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150000"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-bold text-forest"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Unit Basis *</label>
              <input
                type="text"
                value={pricingUnit}
                onChange={(e) => setPricingUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Photo URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
            />
            {coverImage && (
              <img src={coverImage} alt="Preview" className="w-full h-40 object-cover rounded-2xl mt-2 border border-slate-200" />
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-full"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(5)}
              disabled={!price}
              className="bg-forest text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-forest-700 transition disabled:opacity-40"
            >
              Next: Verification Evidence →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: VERIFICATION EVIDENCE (Non-negotiable Rule 13) */}
      {step === 5 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Step 5: Category Verification Evidence</h2>
          <p className="text-xs text-slate-500">
            Upload supportive documentation to receive the <em>Verified Contract</em> badge.
          </p>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <strong>Mandatory Product Rule:</strong> Uploading evidence does NOT automatically mark verification approved. Documentation is independently validated by our land and machinery inspection officers.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Reference / Name</label>
            <input
              type="text"
              value={verificationDocName}
              onChange={(e) => setVerificationDocName(e.target.value)}
              placeholder="e.g. Survey_Plan_Beacon_Kaduna_2026.pdf"
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5"
            />
          </div>

          <label className="flex items-start space-x-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={verificationDeclared}
              onChange={(e) => setVerificationDeclared(e.target.checked)}
              className="mt-0.5 rounded text-forest focus:ring-forest"
            />
            <span className="text-xs text-slate-700">
              I formally declare that I have the lawful authority, ownership, or leasehold right to offer this service on TerraTills.
            </span>
          </label>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-full"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(6)}
              className="bg-forest text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-forest-700 transition"
            >
              Review & Submit →
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: PREVIEW & PUBLISH */}
      {step === 6 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900">Step 6: Preview Listing & Publish Options</h2>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              {category}
            </span>
            <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
            <p className="text-slate-600 whitespace-pre-line">{description}</p>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
              <span>Location: {location.town}, {location.state}</span>
              <span className="text-forest text-sm font-black">₦{Number(price).toLocaleString()} / {pricingUnit}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setStep(5)}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-full"
            >
              ← Back
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={submitting}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('active')}
                disabled={submitting}
                className="px-7 py-2.5 rounded-full bg-forest hover:bg-forest-700 text-white font-bold transition shadow-card"
              >
                {submitting ? 'Publishing...' : 'Publish Listing Now ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

