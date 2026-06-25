// src/lib/monthService.js
import { databases, ID } from './appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const MONTHLY_REPORTS_COLLECTION = import.meta.env.VITE_APPWRITE_MONTHLY_REPORTS_COLLECTION_ID;

export async function closeMonth({
  userId,
  month,
  year,
  stats,
  existingReports
}) {
  // Prevent duplicate closure
  const alreadyClosed = existingReports.some(
    r =>
      Number(r.month) === Number(month) &&
      Number(r.year) === Number(year) &&
      r.isClosed
  );

  if (alreadyClosed) {
    throw new Error("This month has already been closed.");
  }


  const snapshot = {
    userId,
    month: Number(month),
    year: Number(year),
    income: stats.income || 0,
    expenses: stats.totalSpent || stats.expenses || 0,
    savings: stats.savings || 0,
    balance: stats.balance || 0,
    retentionScore: stats.retentionScore || stats.efficiency || 0,
    closedAt: new Date().toISOString(),
    isClosed: true,
  };

  const document = await databases.createDocument(
    DATABASE_ID,
    MONTHLY_REPORTS_COLLECTION,
    ID.unique(),
    snapshot
  );

  return document;
}