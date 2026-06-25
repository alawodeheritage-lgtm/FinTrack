import React, { useState, useMemo } from 'react';
import { Search, Bus, Utensils, TrendingUp, Edit3, Trash2 } from 'lucide-react';
import AmountMask from './AmountMask';
import { filterByMonth, filterByYear } from '../lib/dateUtils';


const Transactions = ({
  currency,
  isPrivate,
  allExpenses,
  selectedMonth,
  selectedYear,
  handleEdit,
  handleDelete,
}) => {

  const [viewMode, setViewMode] = useState('month');
  const [filterCat, setFilterCat] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const filteredTransactions = useMemo(() => {
    let base = allExpenses;

    if (viewMode === 'month') {
      base = filterByMonth(
        base,
        selectedMonth,
        selectedYear
      );
    }

    if (viewMode === 'year') {
      base = filterByYear(
        base,
        selectedYear
      );
    }

    return base
      .filter(t =>
        filterCat === 'All' ||
        t.category === filterCat
      )
      .filter(t =>
        filterType === 'All' ||
        (
          filterType === 'Income'
            ? t.category === 'Income'
            : t.category !== 'Income'
        )
      )
      .filter(t =>
        t.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'amount')
          return b.amount - a.amount;

        if (sortBy === 'category')
          return a.category.localeCompare(b.category);

        return (
          new Date(b.createdAt) -
          new Date(a.createdAt)
        );
      });

  }, [
    allExpenses,
    viewMode,
    selectedMonth,
    selectedYear,
    filterCat,
    filterType,
    searchQuery,
    sortBy
  ]);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in px-4 sm:px-0">
      {/* FILTER CONTROLS WRAPPER: Wrapped grid for compact screen alignments */}
      <div className="flex flex-col gap-4 px-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h3>

        {/* Responsive flex wrapping structure without changing visual elements */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="flex-1 sm:flex-initial bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 outline-none shadow-sm cursor-pointer"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <div className="relative flex-grow min-w-[140px] sm:w-48 order-first sm:order-none w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 sm:flex-initial bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 outline-none shadow-sm cursor-pointer"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>

          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="flex-1 sm:flex-initial bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 outline-none shadow-sm cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Essential">Essential</option>
            <option value="Luxury">Luxury</option>
            <option value="Savings">Savings</option>
          </select>
        </div>
      </div>

      {/* TRANSACTION ITEMS */}
      <div className="space-y-3">
        {filteredTransactions.map((item) => (
          <div key={item.$id} className="group flex items-center justify-between bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 p-4 sm:p-5 rounded-2xl hover:border-blue-500/30 transition-all shadow-sm gap-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="bg-slate-50 dark:bg-[#0b121f] p-2.5 sm:p-3 rounded-xl text-blue-500 flex-shrink-0">
                {item.category === 'Essential' ? <Bus size={18} /> : item.category === 'Luxury' ? <Utensils size={18} /> : <TrendingUp size={18} />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm lg:text-base truncate">{item.title}</h4>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-0.5 whitespace-nowrap">{item.category} • {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white">
                <AmountMask amount={item.amount} currency={currency} prefix="-" isPrivate={isPrivate} />
              </span>
              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-500 transition-colors p-1"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(item.$id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;