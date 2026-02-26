import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  Calculator,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  LineChart,
  Sun,
  Moon
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // --- REFINED THEME LOGIC ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    // If a theme is saved, use it. Otherwise, check if the script already made the page dark.
    if (saved) return saved === 'dark';
    return window.document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050b18] text-slate-900 dark:text-white font-sans selection:bg-blue-500/30 transition-colors duration-500">

      {/* 1. Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#050b18]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FinTrack</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Visualizers</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Expense Logs</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Privacy</a>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-90"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-600" />}
            </button>

            <Link to="/login">
              <button className="text-sm font-semibold text-slate-500 dark:text-slate-300 hover:text-blue-600 transition-colors">Log In</button>
            </Link>

            <Link to="/signup" className="hidden sm:block">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Personal Data Visualization</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-slate-900 dark:text-white">
          See Your Money <br />
          <span className="text-blue-600 text-shadow-glow">Like Never Before.</span>
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The ultimate personal finance tracker. Map out your spending habits, visualize your savings progress, and organize your budget with professional-grade charts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2">
            Open My Tracker <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="relative max-w-5xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <div className="flex gap-4 mb-6">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="w-full h-64 bg-slate-100 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-white/5 flex items-end justify-around p-6">
                {[60, 40, 90, 70, 50, 85, 30].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className="w-8 bg-blue-500/40 rounded-t-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Focus Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Data Points', value: 'Unlimited' },
            { label: 'Visualization', value: '4K Charts' },
            { label: 'Response Time', value: '< 100ms' },
            { label: 'Cloud Sync', value: 'Instant' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center transition-colors">
              <div className="text-3xl md:text-4xl font-black mb-1 text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Feature Cards */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Powerful Data Tools</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<PieChart className="text-blue-500" />}
            title="Spending Breakdown"
            desc="Categorize every expense automatically. See exactly what percentage of your income goes to housing, food, and entertainment."
          />
          <FeatureCard
            icon={<LineChart className="text-blue-500" />}
            title="Trend Tracking"
            desc="Compare your spending month-over-month. Identify patterns and find exactly where you can save more money."
          />
          <FeatureCard
            icon={<Layers className="text-blue-500" />}
            title="Custom Categories"
            desc="Create your own spending buckets. FinTrack adapts to your lifestyle, not the other way around."
          />
        </div>
      </section>

      {/* 5. Visualization Highlight */}
      <section className="px-6 py-20 pb-40">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-700 to-blue-900 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row items-center relative shadow-2xl">
          <div className="p-12 lg:p-20 lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white">Your habits, <br />quantified.</h2>
            <p className="text-blue-100 text-lg mb-10 leading-relaxed">
              We turn your spreadsheet data into a story. Understand your financial health through beautiful, interactive heatmaps and distribution curves.
            </p>
            <ul className="space-y-4">
              {['Export data to CSV/PDF', 'Customizable chart themes', 'Privacy-first architecture'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-semibold text-white">
                  <CheckCircle2 className="w-6 h-6 text-blue-300" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 p-12">
            <div className="bg-white dark:bg-[#050b18] rounded-3xl p-8 shadow-3xl border border-slate-200 dark:border-white/10">
              <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-grow h-2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-2 bg-cyan-500 rounded-full"></div>
                  <div className="flex-grow h-2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-2 bg-indigo-500 rounded-full"></div>
                  <div className="flex-grow h-2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:border-blue-500/20 transition-all">
    <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
      {icon}
    </div>
    <h4 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{title}</h4>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default Home;