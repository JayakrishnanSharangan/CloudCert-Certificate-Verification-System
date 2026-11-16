import React, { useState } from 'react';
import PublicVerify from './pages/PublicVerify';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('verify');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
              C
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">CloudCert</span>
              <span className="text-[10px] block text-indigo-400 font-mono -mt-1">DevSecOps Verified</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'verify' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Public Verification
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Admin Dashboard
            </button>
          </nav>

          {/* Ops Quick Links */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <a
              href="http://localhost:5000/health"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              API Health
            </a>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Grafana
            </a>
          </div>
        </div>
      </header>

      {/* Main View */}
      <main className="flex-1">
        {activeTab === 'verify' ? <PublicVerify /> : <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>INT378 Advancements in Cloud and DevOps Capstone • Jayakrishnan Sharangan (Reg: 12324644)</p>
      </footer>
    </div>
  );
}

