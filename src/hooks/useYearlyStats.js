// src/hooks/useYearlyStats.js
import { useMemo } from 'react';
import { filterByYear, MONTH_NAMES } from '../lib/dateUtils';

export function useYearlyStats(allExpenses, year) {
  const yearlyExpenses = useMemo(
    () => filterByYear(allExpenses, year),
    [allExpenses, year]
  );

  // Per-month breakdown for charts (Optimized to a single pass!)
  const monthlyBreakdown = useMemo(() => {
    // 1. Initialize an empty array for all 12 months
    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      month: MONTH_NAMES[i].slice(0, 3),
      income: 0,
      expenses: 0,
      savings: 0
    }));

    // 2. Loop through expenses exactly ONCE and sort into their months
    yearlyExpenses.forEach(e => {
      const monthIndex = new Date(e.createdAt).getMonth(); // 0-11
      if (monthIndex >= 0 && monthIndex < 12) {
        if (e.category === 'Income') {
          monthsData[monthIndex].income += e.amount;
        } else if (['Essential', 'Luxury'].includes(e.category)) {
          monthsData[monthIndex].expenses += e.amount;
        } else if (e.category === 'Savings') {
          monthsData[monthIndex].savings += e.amount;
        } else if (e.category === 'Withdrawal') {
          monthsData[monthIndex].savings -= e.amount;
        }
      }
    });

    return monthsData;
  }, [yearlyExpenses]);

  // Aggregated totals for your new dashboard box
  const totals = useMemo(() => monthlyBreakdown.reduce((acc, m) => ({
    income: acc.income + m.income,
    expenses: acc.expenses + m.expenses,
    savings: acc.savings + m.savings,
  }), { income: 0, expenses: 0, savings: 0 }), [monthlyBreakdown]);

  return { monthlyBreakdown, ...totals, transactions: yearlyExpenses };
}