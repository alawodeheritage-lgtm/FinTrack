// src/hooks/useMonthlyStats.js
import { useMemo } from 'react';
import { filterByMonth } from '../lib/dateUtils';

export function useMonthlyStats(allExpenses, month, year) {
  const monthlyExpenses = useMemo(
    () => filterByMonth(allExpenses, month, year),
    [allExpenses, month, year]
  );

  return useMemo(() => {
    const income = monthlyExpenses
      .filter(e => e.category === 'Income')
      .reduce((a, c) => a + c.amount, 0);

    const essential = monthlyExpenses
      .filter(e => e.category === 'Essential')
      .reduce((a, c) => a + c.amount, 0);

    const luxury = monthlyExpenses
      .filter(e => e.category === 'Luxury')
      .reduce((a, c) => a + c.amount, 0);

    const savingsDeposits = monthlyExpenses
      .filter(e => e.category === 'Savings')
      .reduce((a, c) => a + c.amount, 0);

    const withdrawals = monthlyExpenses
      .filter(e => e.category === 'Withdrawal')
      .reduce((a, c) => a + c.amount, 0);

    const netSavings = savingsDeposits - withdrawals;
    const totalSpent = essential + luxury;
    const balance = (income + withdrawals) - (essential + luxury + savingsDeposits);
    const retentionScore = income > 0 ? Math.round((netSavings / income) * 100) : 0;

    return {
      income, essential, luxury,
      savingsDeposits, withdrawals,
      netSavings, totalSpent, balance,
      retentionScore,
      transactions: monthlyExpenses
    };
  }, [monthlyExpenses]);
}