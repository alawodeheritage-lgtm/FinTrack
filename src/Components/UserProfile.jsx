// src/components/UserProfile.jsx
import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  ShieldCheck,
  CloudDownload,
  LogOut,
  TrendingUp,
  WalletIcon,
  CheckCircle2,
  Lock
} from 'lucide-react';

// 🛠️ 1. IMPORT DATE UTILITIES & SERVICE LAYER ACTIONS
import { isPastPeriod, MONTH_NAMES } from '../lib/dateUtils';
import { closeMonth } from '../lib/monthService';
import Swal from 'sweetalert2';

const UserProfile = ({
  user,
  currency,
  totalIncome,
  totalSpent,
  efficiency,
  incomeItems,
  expenses,
  handleEdit,
  monthlySavings,
  handleDelete,
  handleExportFinancialAudit,
  handleExportCSV,
  handleLogout,
  setActiveTab,

  // 🛠️ 2. ADD NEW CONDITIONAL PROPS PASSED FROM THE PARENT HOOK CONTROLLER
  selectedMonth,
  selectedYear,
  existingReports = [],
  onRefreshReports
}) => {

  const [isAlertsEnabled, setIsAlertsEnabled] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // Local processing spinner flag

  // 🛠️ 3. COMPUTE LEDGER STATE CONDITIONS BASED ON PASSED BOUNDARIES
  const isPast = isPastPeriod(selectedMonth, selectedYear);
  const isAlreadyClosed = existingReports.some(
    r => Number(r.month) === Number(selectedMonth) && Number(r.year) === Number(selectedYear) && r.isClosed
  );

  // 🛠️ 4. CORE EXECUTION HANDLER
  const handleCloseMonthAction = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This locks all transaction logs for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} permanently into your secure archive storage.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, seal ledger!',
      cancelButtonText: 'Cancel',
      background: document.documentElement.classList.contains('dark') ? '#161f2e' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#0f172a'
    });

    if (!result.isConfirmed) return;

    setIsClosing(true);

    Swal.fire({
      title: 'Sealing Ledger...',
      text: 'Please wait while we secure your historical data.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: document.documentElement.classList.contains('dark') ? '#161f2e' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#0f172a'
    });

    try {
      await closeMonth({
        userId: user.$id || user.id,
        month: Number(selectedMonth),
        year: Number(selectedYear),
        stats: {
          income: totalIncome,
          totalSpent: totalSpent,
          savings: monthlySavings,
          efficiency: efficiency,
          balance: totalIncome - totalSpent
        },
        existingReports
      });

      await Swal.fire({
        title: 'Ledger Sealed!',
        text: 'Historical snapshot added to data logs securely.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
        background: document.documentElement.classList.contains('dark') ? '#161f2e' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#0f172a'
      });

      if (onRefreshReports) onRefreshReports();
    } catch (error) {
      Swal.fire({
        title: 'Ledger Lockout Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: document.documentElement.classList.contains('dark') ? '#161f2e' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#0f172a'
      });
    } finally {
      setIsClosing(false);
    }
  };

  const filteredIncome = incomeItems.filter(item => {
    const date = new Date(item.createdAt);
    return (
      date.getMonth() + 1 === Number(selectedMonth) &&
      date.getFullYear() === Number(selectedYear)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 px-4 sm:px-6 md:px-0 pb-10">

      {/* USER HEADER CARD */}
      <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-xl shadow-blue-600/20">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-emerald-500 border-4 border-white dark:border-[#161f2e] w-6 h-6 md:w-8 md:h-8 rounded-full shadow-sm"></div>
          </div>
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{user.name}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-600 border border-blue-600/20 w-fit mx-auto md:mx-0">
                Pro Member
              </span>
            </div>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium mt-1 md:mt-2 break-all">{user.email}</p>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Income', val: totalIncome, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Total Expenses', val: totalSpent, color: 'text-rose-500', bg: 'bg-rose-500/5' },
          { label: 'Saved Ratio', val: `${efficiency}%`, color: 'text-blue-500', bg: 'bg-blue-500/5' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} border border-slate-200 dark:border-white/5 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-center`}>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
            <h4 className={`text-lg md:text-xl font-black ${stat.color}`}>
              {typeof stat.val === 'number' ? `${currency}${stat.val.toLocaleString()}` : stat.val}
            </h4>
          </div>
        ))}
      </div>

      {/* REVENUE STREAMS */}
      <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">Revenue Streams</h4>
            <p className="text-xs text-slate-500 font-medium">Manage your incoming data</p>
          </div>
          <button onClick={() => setActiveTab('Dashboard')} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0b121f] text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Plus size={18} /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncome.map(source => (
            <div key={source.$id} className="group flex flex-row justify-between items-center p-4 md:p-5 bg-slate-50 dark:bg-[#0b121f] rounded-[1.5rem] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-emerald-500/10 p-2 md:p-2.5 rounded-xl text-emerald-600 flex-shrink-0"><TrendingUp size={16} /></div>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base truncate">{source.title}</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <span className="text-emerald-600 font-black text-sm md:text-base">+{currency}{source.amount.toLocaleString()}</span>
                <button onClick={() => handleEdit(source)} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-all p-1"><Edit3 size={15} /></button>
                <button onClick={() => handleDelete(source.$id)} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all p-1"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADVANCED INTEGRATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:grid-cols-1 md:gap-8">
        {/* Security & Alerts */}
        <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Sparkles size={18} className="text-blue-500" /> FinTrack Intelligence</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0b121f] rounded-2xl border border-slate-200 dark:border-white/5">
              <div className="pr-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Smart Push Alerts</p>
                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Notify on high spending</p>
              </div>
              <button onClick={() => setIsAlertsEnabled(!isAlertsEnabled)} className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${isAlertsEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAlertsEnabled ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0b121f] rounded-2xl border border-slate-200 dark:border-white/5">
              <div className="pr-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">2FA Security</p>
                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Biometric/Cloud Auth</p>
              </div>
              <button onClick={() => setIs2FAEnabled(!is2FAEnabled)} className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${is2FAEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${is2FAEnabled ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Reports & Documents */}
        <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
          <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <WalletIcon size={18} className="text-blue-500" /> Vault & Data
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleExportFinancialAudit}
              className="flex flex-col items-center justify-center p-4 md:p-6 bg-blue-600/5 hover:bg-blue-600/10 border border-blue-500/10 rounded-[1.5rem] md:rounded-[2rem] transition-all group"
            >
              <ShieldCheck className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Generate Audit</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex flex-col items-center justify-center p-4 md:p-6 bg-amber-600/5 hover:bg-amber-600/10 border border-amber-500/10 rounded-[1.5rem] md:rounded-[2rem] transition-all group"
            >
              <CloudDownload className="text-amber-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACCOUNTING PERIOD INTEGRITY WORKFLOW */}
      <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">Accounting Period Integrity</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Verify accuracy variables and commit permanent snapshots to immutable cloud history.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {isAlreadyClosed ? (
              <div className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl md:rounded-2xl text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 size={16} /> Period Closed & Sealed
              </div>
            ) : isPast ? (
              <button
                onClick={handleCloseMonthAction}
                disabled={isClosing}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl md:rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-blue-600/10"
              >
                <Lock size={14} />
                {isClosing ? 'Processing Security Lock...' : `Close ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500 rounded-xl md:rounded-2xl text-xs font-bold uppercase tracking-wider italic">
                Active Cycle In Progress
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SESSION MANAGEMENT */}
      <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="text-center lg:text-left">
          <h4 className="font-bold text-rose-500 text-base md:text-lg mb-1">Session Management</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">Sign out to clear your local session and protect your cloud data.</p>
        </div>
        <button onClick={handleLogout} className="w-full lg:w-auto px-8 md:px-10 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
          <LogOut size={18} /> Secure Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;