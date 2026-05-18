import React from 'react';
import { BarChart3, Zap } from 'lucide-react';
import AmountMask from './AmountMask';

const Reports = ({
  currency,
  categoryConfig,
  totals,
  allocationData,
  efficiency,
  yearlyProjection,
  fiveYearProjection,
  proInsight,
  isPrivate
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
      {/* LEFT: SPENDING BARS & PIE DISTRIBUTION */}
      <div className="lg:col-span-2 bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 flex flex-col shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-10 flex items-center gap-2 text-lg">
          <BarChart3 className="text-blue-500" size={22} /> Spending Analysis
        </h3>

        {/* SPENDING BARS */}
        <div className="flex items-end justify-around h-72 gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
          {['Essential', 'Luxury', 'Savings'].map((cat) => {
            const val = totals[cat] || 0;
            const max = Math.max(totals.Essential, totals.Luxury, totals.Savings, 1);
            const height = (val / max) * 100;
            return (
              <div key={cat} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <div
                  className={`w-full max-w-[85px] rounded-t-[1.5rem] transition-all duration-1000 relative ${categoryConfig[cat]?.bg}`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1.5 rounded-xl text-xs font-black text-white opacity-0 group-hover:opacity-100 transition-all z-10 shadow-2xl">
                    {currency}{val.toLocaleString()}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-black mt-6 uppercase tracking-[0.2em]">{cat}</span>
              </div>
            );
          })}
        </div>

        {/* PIE CHART INTEGRATION */}
        <div className="mt-12 flex flex-col md:flex-row items-center gap-12 px-4">
          <div
            className="w-36 h-36 rounded-full relative shadow-2xl shrink-0"
            style={{
              background: `conic-gradient(
                ${categoryConfig.Essential.color} 0% ${allocationData.essential}%, 
                ${categoryConfig.Luxury.color} ${allocationData.essential}% ${allocationData.essential + allocationData.luxury}%, 
                ${categoryConfig.Savings.color} ${allocationData.essential + allocationData.luxury}% 100%
              )`
            }}
          >
            <div className="absolute inset-10 bg-white dark:bg-[#161f2e] rounded-full flex flex-col items-center justify-center">
              <span className="text-[8px] font-black opacity-30 uppercase tracking-tighter">Budget</span>
              <span className="text-xs font-black dark:text-white">Split</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-6 w-full text-center md:text-left">
            {['Essential', 'Luxury', 'Savings'].map(cat => (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className={`w-2 h-2 rounded-full ${categoryConfig[cat].bg}`}></div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{cat}</span>
                </div>
                <p className="text-2xl font-black dark:text-white">{Math.round(allocationData[cat.toLowerCase()] || 0)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: WEALTHINTELLIGENCE AI */}
      <div className={`rounded-[3rem] p-10 text-white shadow-2xl flex flex-col relative overflow-hidden h-full min-h-[650px] transition-all duration-1000
        ${efficiency >= 20 ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>

        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col h-full items-center">
          <div className="flex items-center gap-2 mb-12 self-start">
            <Zap size={20} className="text-white/80" fill="currentColor" />
            <h1 className="font-black text-xl tracking-tight uppercase">FinTrack AI</h1>
          </div>

          {/* ARROW GAUGE */}
          <div className="relative w-64 h-32 overflow-hidden mb-8">
            <div className="w-64 h-64 border-[16px] border-white/10 rounded-full"></div>
            <div
              className="absolute bottom-0 left-1/2 w-1.5 h-28 bg-white origin-bottom transition-all duration-1000 ease-out shadow-[0_0_15px_white]"
              style={{ transform: `translateX(-50%) rotate(${(efficiency / 100) * 180 - 90}deg)` }}
            >
              <div className="w-4 h-4 bg-white rounded-full absolute -top-1 left-1/2 -translate-x-1/2 border-2 border-emerald-600"></div>
            </div>
          </div>

          <div className="text-center mb-10">
            <span className="text-7xl font-black tracking-tighter tabular-nums">{efficiency}%</span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mt-2">Retention Score</p>
          </div>

          {/* STATUS MONITOR */}
          <div className="w-full space-y-4 mb-8">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-70">
              <span>Monthly Target</span>
              <span>{currency}20,000</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min(efficiency, 100)}%` }}></div>
            </div>
          </div>

          {/* AI INSIGHT & PROJECTION */}
          <div className="mt-auto w-full space-y-6">
            {/* FUTURE FORECAST BOX */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">1-Year Forecast</span>
                <AmountMask amount={yearlyProjection} currency={currency} isPrivate={isPrivate} className="text-lg font-black" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">5-Year Growth</span>
                <span className="text-lg font-black text-emerald-300">
                  <AmountMask amount={fiveYearProjection} currency={currency} isPrivate={isPrivate} className="inline-block" />*
                </span>
              </div>
              <p className="text-[8px] font-medium opacity-40 mt-3 text-center uppercase tracking-tighter italic">
                *Based on current {efficiency}% retention rate
              </p>
            </div>

            {/* AI INSIGHT TEXT */}
            <div className="text-center px-2">
              <p className="text-sm font-bold leading-relaxed italic opacity-90">
                "{proInsight}"
              </p>
            </div>

            {/* SYSTEM STATUS */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_white]"></div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Projection Engine: Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
