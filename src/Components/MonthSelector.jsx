// src/components/MonthSelector.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePeriod } from '../context/PeriodContext';
import { MONTH_NAMES } from '../lib/dateUtils';

const MonthSelector = () => {
  const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear } = usePeriod();

  const prev = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const next = () => {
    const now = new Date();
    if (selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1) return;
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 shadow-sm">
      <button onClick={prev} className="text-slate-400 hover:text-blue-500 transition-colors">
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[130px] text-center">
        {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
      </span>
      <button onClick={next} className="text-slate-400 hover:text-blue-500 transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default MonthSelector;