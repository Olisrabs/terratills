import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { LoadingView, ErrorView } from '../components/StateViews';

export default function VerificationView() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const subTypeParam = routeParams.type;

  const [verData, setVerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Submission Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeType, setActiveType] = useState(subTypeParam || 'farmland_authority');
  const [docName, setDocName] = useState('');
  const [declared, setDeclared] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/verification');
      if (!res.ok) throw new Error('Failed to load verification status');
      const data = await res.json();
      setVerData(data);

      if (subTypeParam) {
        setActiveType(subTypeParam);
        setShowSubmitModal(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [currentUser, subTypeParam]);

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!declared) {
      showToast('You must confirm the legal declaration.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/verification/submit', {
        method: 'POST',
        body: JSON.stringify({
          type: activeType,
          type_title: activeType === 'farmland_authority' ? 'Farmland Lease Authority' : 'Machinery Ownership',
          documents: [{ name: docName || 'Legal_Gazette_Deed.pdf', size: '2.8 MB' }],
          declaration_accepted: declared,
          notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      showToast('Evidence submitted! Verification team will review within 24 hours.', 'success');
      setShowSubmitModal(false);
      setDocName('');
      setNotes('');
      fetchVerifications();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView message="Loading verification records and land registry desks..." />;
  if (error) return <ErrorView error={error} onRetry={fetchVerifications} />;

  const { accountVerification, submissions = [] } = verData || {};

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-6 space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Trust & Verification Centre</h1>
        <p className="text-xs text-slate-500">
          Independent validation of identity, land title authority, machinery fitness, and agronomy credentials.
        </p>
      </div>

      {/* Account Verification Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">NIN / National Identity</span>
            <span className="text-xs font-bold text-slate-900">Level 2 Verified</span>
          </div>
          <span className="text-xs bg-emerald-100 text-forest font-bold px-2.5 py-0.5 rounded-full">✓ Approved</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Phone & Email</span>
            <span className="text-xs font-bold text-slate-900">+234 Verified</span>
          </div>
          <span className="text-xs bg-emerald-100 text-forest font-bold px-2.5 py-0.5 rounded-full">✓ Approved</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Machinery Registry</span>
            <span className="text-xs font-bold text-slate-900">Tractor Fleet</span>
          </div>
          <span className="text-xs bg-emerald-100 text-forest font-bold px-2.5 py-0.5 rounded-full">✓ Approved</span>
        </div>
      </div>

      {/* Service-Specific Verification Requirements (Destination 36) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Service Category Credentials</h2>
            <p className="text-xs text-slate-500">Only required if you list services in these categories</p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-forest text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-forest-700 transition"
          >
            + Submit Evidence
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-slate-900">Farmland Leasehold & Title Authority</h4>
              <p className="text-slate-500 text-[11px]">
                Accepts Certificate of Occupancy (C of O), Governor's Consent, or Local Govt Gazette.
              </p>
            </div>
            <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-[10px] self-start sm:self-auto">
              Under Review (Kaduna State Lands Bureau)
            </span>
          </div>

          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-slate-900">Machinery Ownership & Operator Certification</h4>
              <p className="text-slate-500 text-[11px]">
                Chassis documentation, bill of sale, and certified tractor operator driving credentials.
              </p>
            </div>
            <span className="bg-emerald-100 text-forest font-bold px-3 py-1 rounded-full text-[10px] self-start sm:self-auto">
              ✓ Approved (Massey Ferguson Fleet)
            </span>
          </div>
        </div>
      </div>

      {/* Historical Submissions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Verification Submission Audit History</h3>
        {submissions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No submissions on record.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{sub.type_title}</span>
                  <span className="text-[10px] text-slate-400">
                    Submitted: {new Date(sub.submitted_at).toLocaleDateString()} • {sub.documents?.[0]?.name}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  sub.status === 'approved' ? 'bg-emerald-100 text-forest' : 'bg-amber-100 text-amber-800'
                }`}>
                  {sub.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Modal (Destination 37) */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Verification Documentation"
        footer={
          <>
            <button
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitVerification}
              disabled={submitting || !declared}
              className="px-6 py-2 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-700 disabled:opacity-40"
            >
              {submitting ? 'Submitting...' : 'Submit for Officer Review ✓'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Verification Category</label>
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            >
              <option value="farmland_authority">Farmland Lease Authority & Title</option>
              <option value="machinery_ownership">Machinery Ownership & Operator License</option>
              <option value="training_credential">Agronomy Instructor Certification</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document File Name / Reference</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Survey_Plan_CofO_Oyo_2026.pdf"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Additional Submission Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide land coordinates or surveyor seal number..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <label className="flex items-start space-x-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              className="mt-0.5 rounded text-forest focus:ring-forest"
              required
            />
            <span className="text-slate-700 text-[11px] leading-relaxed">
              I certify that this document is genuine and lawfully belongs to me or my agricultural enterprise. I authorize TerraTills to cross-reference with statutory registries.
            </span>
          </label>
        </form>
      </Modal>
    </div>
  );
}

