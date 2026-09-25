import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ShieldCheck,
  Zap,
  ThermometerSnowflake,
  Coins,
  Boxes,
  Microscope,
  FileCheck2,
  Factory,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Layers,
  Lock,
  ChevronRight,
  Globe2,
  Activity
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});

  const modules = [
    {
      icon: Boxes,
      title: 'Chemical & Raw Material Stock',
      description: 'FEFO/FIFO dispatch, strict quarantine segregation, hazardous material safety controls, and multi-warehouse bin location tracking.',
      badge: 'FEFO Driven'
    },
    {
      icon: Microscope,
      title: 'Quality & Lab Assurance',
      description: 'Certificate of Analysis (CoA) validation, batch release workflows, quarantine holds, and rapid product recall trace matrices.',
      badge: 'EFDA Standard'
    },
    {
      icon: Coins,
      title: 'Procurement & Forex Allocation',
      description: 'Manage international API supplier orders, foreign currency allocations (USD/EUR/ETB), and lead time analytics.',
      badge: 'Forex Optimized'
    },
    {
      icon: Factory,
      title: 'Production & Recipe BOMs',
      description: 'Multi-level Bill of Materials, WIP tracking, batch recipe formulations, and theoretical vs. actual yield variance calculations.',
      badge: 'Yield Analytics'
    },
    {
      icon: ThermometerSnowflake,
      title: 'IoT Cold Chain Telemetry',
      description: 'Continuous temperature and humidity sensor monitoring with real-time excursion alerts for heat-sensitive biologicals and reagents.',
      badge: 'MQTT Powered'
    },
    {
      icon: FileCheck2,
      title: 'Regulatory & eRIS Compliance',
      description: 'Automated tax valuations, eRIS ledger exports, and immutable audit logs compliant with Ethiopian manufacturing regulations.',
      badge: 'Audit Ready'
    }
  ];

  const highlights = [
    {
      metric: '100%',
      label: 'Batch Traceability',
      detail: 'From raw material container receipt to finished pharmaceutical distribution.'
    },
    {
      metric: '< 1s',
      label: 'Recall Isolation Speed',
      detail: 'Instant forward and reverse genealogy mapping for contaminated lots.'
    },
    {
      metric: 'Zero',
      label: 'Unrecorded Shrinkage',
      detail: 'Automated FEFO inventory turnover minimizing expiry losses.'
    },
    {
      metric: 'Offline',
      label: 'Resilient PWA Sync',
      detail: 'Store transactions locally in warehouse dead-zones and auto-reconcile.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-xs py-2 px-4 text-center font-medium text-blue-100 flex items-center justify-center gap-2 border-b border-blue-600/40">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900/60 text-blue-200 border border-blue-400/30">
          EFDA COMPLIANT
        </span>
        <span>Ethiopian Food and Drug Authority standards & Forex multi-currency tracking enabled</span>
        <span className="hidden sm:inline-block text-blue-300">|</span>
        <span className="hidden sm:inline-block text-emerald-300 flex items-center gap-1 font-semibold">
          <Activity size={12} className="inline animate-pulse" /> All Systems Online
        </span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="text-white" size={22} />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                AIMS
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Pharma & Chem
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium -mt-0.5">
                Advanced Inventory Management System
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#compliance" className="hover:text-blue-400 transition-colors">Compliance</a>
            <a href="#modules" className="hover:text-blue-400 transition-colors">Modules</a>
            <a href="#architecture" className="hover:text-blue-400 transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-md shadow-blue-600/30"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5"
              >
                Sign In to Console
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-blue-400 text-xs font-semibold mb-6">
              <ShieldCheck size={16} className="text-emerald-400" />
              Next-Generation Manufacturing & Chemical Traceability
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Chemical & Pharmaceutical{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                Inventory Intelligence
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
              Engineered specifically for chemical plants and pharmaceutical formulation factories.
              Enforce strict FEFO expiration controls, quarantine approvals, multi-currency forex procurement, and EFDA regulatory compliance in one unified platform.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5"
              >
                {isAuthenticated ? "Enter Application Dashboard" : "Sign In to AIMS Console"}
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                Explore Modules
                <ChevronRight size={18} className="text-slate-400" />
              </a>
            </div>

            {/* Quick Pills */}
            <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Quarantine & Lab Release Workflows</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Forex Allocation (USD / EUR / ETB)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Real-Time FEFO Expiry Routing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Full Audit Logs & 21 CFR Part 11</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Metrics Bar */}
      <section className="bg-slate-950/60 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {highlights.map((h, i) => (
              <div key={i} className="text-center md:text-left border-l-2 border-blue-500/50 pl-4">
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                  {h.metric}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-200">{h.label}</div>
                <div className="mt-0.5 text-xs text-slate-400">{h.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400">
              Complete Plant Infrastructure
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              End-to-End Chemical Supply Chain
            </p>
            <p className="mt-4 text-base text-slate-400">
              Purpose-built modules designed for the unique operational challenges of chemical formulation and pharmaceutical production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon size={24} />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-700/60 text-blue-300 border border-slate-600/50">
                        {m.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-700/40 flex items-center justify-between text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Explore module specifications</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ethiopian Regulatory & Compliance Showcase */}
      <section id="compliance" className="py-20 bg-slate-950 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Globe2 size={15} />
                Ethiopian Industrial Context
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Designed for EFDA Standards & National Import Realities
              </h2>
              <p className="text-slate-300 leading-relaxed text-base">
                Operating a chemical and pharmaceutical plant in Ethiopia requires specialized handling for foreign currency queues, tax assessments, and regulatory inspection audits. AIMS provides native tools tailored to these requirements:
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex-shrink-0 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">EFDA Mandatory Lot Genealogies</h4>
                    <p className="text-slate-400 text-xs mt-1">Automatic quarantine on raw material arrival until QA issues a verified Certificate of Analysis.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex-shrink-0 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Forex Multi-Currency Ledger</h4>
                    <p className="text-slate-400 text-xs mt-1">Track import Letters of Credit (L/C), bank allocations in USD/EUR, and convert to Birr (ETB) at current exchange rates.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex-shrink-0 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">eRIS & Tax Valuation Export</h4>
                    <p className="text-slate-400 text-xs mt-1">One-click formatted exports directly reconcilable with the Ethiopian Revenue & Invoicing System.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="text-xs font-mono text-slate-400 mb-4 pb-3 border-b border-slate-800 flex justify-between items-center">
                <span>SYSTEM HEALTH & COMPLIANCE STATUS</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  OPERATIONAL
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-300 font-semibold">Active Quarantine Batches</span>
                    <span className="text-amber-400 font-bold">4 Batches</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-300 font-semibold">FEFO Dispatch Compliance</span>
                    <span className="text-emerald-400 font-bold">99.8%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '99.8%' }}></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-300 font-semibold">Cold Chain Sensor Health (MQTT)</span>
                    <span className="text-blue-400 font-bold">12 Sensors Active</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-300 font-semibold">Forex Utilization (Q3 USD)</span>
                    <span className="text-indigo-400 font-bold">$142,500 / $200,000</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '71%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="py-16 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border-t border-b border-blue-800/40 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Manage Factory Inventory?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-blue-200">
            Sign in with your role-based credentials to access the AIMS executive dashboard, warehouse terminals, quality control, or production schedules.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-blue-900 font-bold text-base shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              {isAuthenticated ? "Open Dashboard" : "Access Staff Login"}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 text-slate-400 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-xs">
              A
            </div>
            <span className="font-bold text-white text-sm">AIMS Chemical & Pharma</span>
            <span className="text-slate-600">•</span>
            <span>Version 1.0.0</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-blue-400 transition-colors">Staff Login</Link>
            <a href="#compliance" className="hover:text-blue-400 transition-colors">EFDA Compliance</a>
            <a href="#modules" className="hover:text-blue-400 transition-colors">Factory Modules</a>
            <span className="text-slate-700">|</span>
            <span>© {new Date().getFullYear()} AIMS Factory Platform.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
