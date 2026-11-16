import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    recipient_name: '',
    course_name: '',
    issuer_name: 'Lovely Professional University',
    issue_date: new Date().toISOString().split('T')[0]
  });
  const [issueSuccess, setIssueSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchCertificates();
    fetchAuditLogs();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      }
    } catch {
      setHealthStatus({ status: 'OFFLINE' });
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/certificates`);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/certificates/audit-logs`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIssueSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to issue certificate');
      } else {
        setIssueSuccess(data.certificate);
        setFormData({
          recipient_name: '',
          course_name: '',
          issuer_name: 'Lovely Professional University',
          issue_date: new Date().toISOString().split('T')[0]
        });
        fetchCertificates();
        fetchAuditLogs();
      }
    } catch (err) {
      setFormError('Network error issuing certificate');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (certificateId, currentStatus) => {
    const nextStatus = currentStatus === 'VALID' ? 'REVOKED' : 'VALID';
    try {
      const res = await fetch(`${API_BASE}/api/certificates/${certificateId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, actor: 'admin' })
      });
      if (res.ok) {
        fetchCertificates();
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Header & Ops Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Registry Administration</h1>
          <p className="text-slate-400 text-sm">Issue, audit, and revoke verifiable cryptographic credentials</p>
        </div>

        {/* System Health Pill */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${healthStatus?.status === 'UP' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <span className="font-semibold text-slate-300">
              API Status: {healthStatus?.status || 'CHECKING...'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-indigo-400 font-mono">{healthStatus?.database || 'Local Mode'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Issue Certificate Form */}
        <div className="glass-panel p-6 rounded-2xl h-fit">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎓</span> Issue New Certificate
          </h2>

          {formError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {formError}
            </div>
          )}

          {issueSuccess && (
            <div className="p-4 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <div className="font-bold mb-1">✅ Certificate Created!</div>
              <div className="font-mono text-[11px] break-all mb-2">ID: {issueSuccess.certificate_id}</div>
              {issueSuccess.qr_code_url && (
                <img src={issueSuccess.qr_code_url} alt="QR Code" className="w-24 h-24 bg-white p-1 rounded" />
              )}
            </div>
          )}

          <form onSubmit={handleIssueCertificate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Recipient Name *
              </label>
              <input
                type="text"
                required
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Course / Certification Program *
              </label>
              <input
                type="text"
                required
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                placeholder="e.g. AWS & DevSecOps Engineering"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Issuing Organization *
              </label>
              <input
                type="text"
                required
                value={formData.issuer_name}
                onChange={(e) => setFormData({ ...formData, issuer_name: e.target.value })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30"
            >
              {loading ? 'Minting & Recording...' : 'Generate & Register'}
            </button>
          </form>
        </div>

        {/* Right Column: Issued Certificates Table & Audit Trail */}
        <div className="lg:col-span-2 space-y-8">
          {/* Certificates Table */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Active & Revoked Certificates</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Certificate ID</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {certificates.map((cert) => (
                    <tr key={cert.certificate_id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-300">{cert.certificate_id}</td>
                      <td className="px-4 py-3 font-semibold text-white">{cert.recipient_name}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{cert.course_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cert.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleStatus(cert.certificate_id, cert.status)}
                          className={`text-xs px-2.5 py-1 rounded transition ${cert.status === 'VALID' ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'}`}
                        >
                          {cert.status === 'VALID' ? 'Revoke' : 'Reinstate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {certificates.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-500 text-xs">
                        No certificates recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail Log */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Immutable Audit Trail</h2>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              {auditLogs.map((log) => (
                <div key={log.audit_id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold px-1.5 py-0.5 rounded ${log.action === 'CREATED' ? 'bg-indigo-500/20 text-indigo-300' : log.action === 'REVOKED' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {log.action}
                    </span>
                    <span className="font-mono text-slate-300">{log.certificate_id}</span>
                  </div>
                  <div className="text-slate-400">
                    by <span className="text-slate-200">{log.performed_by}</span> • {new Date(log.performed_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

