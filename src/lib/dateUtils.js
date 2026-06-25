// src/lib/dateUtils.js

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

/** Filter transactions to a specific month+year */
export function filterByMonth(transactions, month, year) {
  return transactions.filter(t => {
    const d = new Date(t.createdAt);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
}

/** Filter transactions to a specific year */
export function filterByYear(transactions, year) {
  return transactions.filter(t => new Date(t.createdAt).getFullYear() === year);
}

/** Get unique [month, year] pairs from transactions */
export function getAvailablePeriods(transactions) {
  const seen = new Set();
  return transactions
    .map(t => {
      const d = new Date(t.createdAt);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    })
    .filter(p => {
      const key = `${p.year}-${p.month}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

/** Check if a given month/year is in the past (safe to close) */
export function isPastPeriod(month, year) {
  const now = new Date();
  return year < now.getFullYear() || 
    (year === now.getFullYear() && month < now.getMonth() + 1);
}