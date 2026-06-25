import React from 'react';
import { Eye, EyeOff, Plus, Send, Sparkles } from 'lucide-react';
import AmountMask from './AmountMask';
// import { useYearlyStats } from '../hooks/useYearlyStats';
const DashboardTab = ({
  currency,
  categoryConfig,
  totalIncome,
  remainingBalance,
  totals,
  proInsight,
  name,
  setName,
  amount,
  setAmount,
  category,
  setCategory,
  editingId,
  resetForm,
  handleAddEntry,
  efficiency,
  safetyNet,
  isPrivate,
  setIsPrivate,
  yearlyIncome,
  selectedYear
}) => {

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 px-4 sm:px-0">
      {/* TOP BOX: Yearly Income */}
      <div className="bg-blue-600/5 border border-blue-500/10 p-5 md:p-6 rounded-[2rem] text-center relative overflow-hidden group flex flex-col justify-center min-h-[110px]">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

        <p className="text-[10px] font-black uppercase text-blue-500 dark:text-blue-400 tracking-widest mb-1">
          Yearly Income ({selectedYear})
        </p>

        <h4 className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400 truncate">
          <AmountMask
            amount={yearlyIncome}
            currency={currency}
            isPrivate={isPrivate}
          />
        </h4>
      </div>

      {/* INCOME & SAVINGS TOP CARD */}
      <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Monthly Income
              </label>

              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all"
              >
                {isPrivate ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="w-full bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
              <AmountMask amount={totalIncome} currency={currency} isPrivate={isPrivate} />
            </div>

            <div className="flex items-center gap-1.5 mt-2 px-1">
              <Sparkles size={12} className="text-blue-500 flex-shrink-0" />
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight break-words">
                {proInsight}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 md:p-5 rounded-2xl text-center min-w-0">
              <p className="text-emerald-600 text-[10px] font-black uppercase">Balance</p>
              <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
                <AmountMask amount={remainingBalance} currency={currency} isPrivate={isPrivate} />
              </h4>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 p-4 md:p-5 rounded-2xl text-center min-w-0">
              <p className="text-blue-600 text-[10px] font-black uppercase">Savings</p>
              <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
                <AmountMask amount={totals.Savings} currency={currency} isPrivate={isPrivate} />
              </h4>
            </div>
          </div>

        </div>
      </div>

      {/* TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* QUICK ENTRY FORM */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-sm">

          <h3 className="text-md font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" /> Quick Entry
          </h3>

          {totalIncome > 0 && efficiency < 20 && (
            <div className="rounded-2xl sm:rounded-3xl border border-amber-300/40 bg-amber-50/80 dark:bg-amber-500/10 p-4 mb-4 text-sm text-amber-700 dark:text-amber-200">
              <p className="font-bold">Savings Booster</p>
              <p>You are saving only {efficiency}% of your income. Aim for at least 20% of monthly earnings.</p>

              <button
                type="button"
                onClick={() => { setCategory('Savings'); setName('Savings Deposit'); }}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition"
              >
                Use Savings Category
              </button>
            </div>
          )}

          <form onSubmit={handleAddEntry} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Item Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
            />

            <div className="relative flex items-center w-full">
              <div className={`absolute left-3 w-2 h-2 rounded-full transition-all ${categoryConfig[category]?.bg || 'bg-slate-400'}`}></div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-xl p-3 pl-8 text-sm outline-none dark:text-white appearance-none cursor-pointer"
              >
                <option value="Essential">Essential</option>
                <option value="Luxury">Luxury</option>
                <option value="Savings">Savings</option>
                <option value="Withdrawal">Withdrawal</option>
                <option value="Income">Income</option>
              </select>
            </div>

            <div className="flex gap-3 items-center w-full">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-3 flex justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 text-sm">
                <Send size={16} /> {editingId ? 'Update' : 'Add'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl py-3 transition-all hover:bg-slate-300 dark:hover:bg-slate-600 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* FINANCIAL RUNWAY */}
        <div className="bg-white dark:bg-[#161f2e] p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between gap-6 lg:gap-0">

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Financial Runway
              </h3>
            </div>

            <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {safetyNet} <span className="text-sm font-medium opacity-50 uppercase">Months</span>
            </p>
          </div>

          <div className="mt-2 lg:mt-4">
            <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                style={{ width: `${Math.min((parseFloat(safetyNet) / 6) * 100, 100)}%` }}
              ></div>
            </div>

            <p className="text-[9px] mt-2 opacity-50 font-bold uppercase tracking-tighter">
              Target: 6 Months Safety
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardTab;