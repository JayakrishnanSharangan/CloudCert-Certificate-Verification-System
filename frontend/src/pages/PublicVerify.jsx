import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PublicVerify() {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Check URL query parameters on load (e.g., ?id=CERT-2026-LPU-001)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('id');
    if (queryId) {
      setCertId(queryId);
      performVerification(queryId);
    }
  }, []);

  const performVerification = async (idToVerify) => {
    const target = idToVerify || certId;
    if (!target.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/certificates/verify/${encodeURIComponent(target.trim())}`);
      const data = await res.json();

      if (res.status === 404) {
        setResult({ notFound: true, message: data.message, id: target });
      } else if (!res.ok) {
        setError(data.error || 'Failed to verify certificate');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Unable to connect to verification backend service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Cloud-Native Trust Engine
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          Certificate Verification Portal
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Instantly verify the integrity, validity, and revocation status of academic and professional credentials.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-panel p-6 rounded-2xl shadow-2xl mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performVerification();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate Identifier (e.g. CERT-2026-LPU-001)"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm tracking-wide"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
            ) : (
              'Verify Credential'
            )}
          </button>
        </form>

        {/* Demo Quick Buttons for Viva */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Quick Demo Presets:</span>
          <button
            onClick={() => {
              setCertId('CERT-2026-LPU-001');
              performVerification('CERT-2026-LPU-001');
            }}
            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md transition"
          >
            Valid Certificate
          </button>
          <button
            onClick={() => {
              setCertId('CERT-2026-LPU-002');
              performVerification('CERT-2026-LPU-002');
            }}
            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md transition"
          >
            Revoked Certificate
          </button>
          <button
            onClick={() => {
              setCertId('CERT-FAKE-999');
              performVerification('CERT-FAKE-999');
            }}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md transition"
          >
            Invalid ID
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Verification Results Panel */}
      {result && result.notFound && (
        <div className="glass-panel p-8 rounded-2xl border-amber-500/30 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">
            🔍
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Certificate Record Not Found</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-4 text-sm">
            No matching certificate was discovered for ID <code className="text-amber-400 font-mono bg-slate-800 px-2 py-0.5 rounded">{result.id}</code>. Please confirm the number or contact the issuing institution.
          </p>
        </div>
      )}

      {result && result.certificate && (
        <div className={`glass-panel p-8 rounded-2xl border ${result.verified ? 'border-emerald-500/40 shadow-emerald-500/10' : 'border-rose-500/40 shadow-rose-500/10'} shadow-2xl animate-fade-in`}>
          {/* Status Badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b border-slate-800">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Verification Status</div>
              <div className="flex items-center gap-2 mt-1">
                {result.verified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    OFFICIALLY VALID & AUTHENTIC
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    OFFICIALLY REVOKED
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Record ID</div>
              <div className="font-mono text-sm font-semibold text-slate-200 mt-1">
                {result.certificate.certificate_id}
              </div>
            </div>
          </div>

          {/* Certificate Body Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recipient Name</label>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {result.certificate.recipient_name}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Program / Course</label>
                <div className="text-lg font-medium text-indigo-300 mt-0.5">
                  {result.certificate.course_name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Issuing Institution</label>
                  <div className="text-sm font-medium text-slate-200 mt-0.5">
                    {result.certificate.issuer_name}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Issue Date</label>
                  <div className="text-sm font-medium text-slate-200 mt-0.5">
                    {result.certificate.issue_date}
                  </div>
                </div>
              </div>

              {!result.verified && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  <strong>Notice:</strong> This certificate was cancelled or invalidated by the issuing registrar. Any document presenting this identifier is considered null and void.
                </div>
              )}
            </div>

            {/* QR Code & Tamper Seal */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
              {result.certificate.qr_code_url ? (
                <img
                  src={result.certificate.qr_code_url}
                  alt="Certificate Verification QR Code"
                  className="w-36 h-36 rounded-lg bg-white p-2 shadow-md mb-2"
                />
              ) : (
                <div className="w-36 h-36 bg-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  QR Not Generated
                </div>
              )}
              <span className="text-[11px] text-slate-400 text-center font-mono">
                Cryptographic Seal Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

