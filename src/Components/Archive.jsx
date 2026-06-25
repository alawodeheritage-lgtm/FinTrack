import React from 'react';
import { Archive, Lock } from 'lucide-react';

const ArchivePage = ({
  reports,
  currency
}) => {
  return (
    <div className="space-y-6">

      <div className="bg-white dark:bg-[#161f2e] rounded-[2rem] p-8 border border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <Archive className="text-blue-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Financial Archive
          </h2>
        </div>

        <p className="text-slate-500 text-sm">
          Permanently sealed monthly records.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white dark:bg-[#161f2e] rounded-[2rem] p-10 text-center">
          <p className="text-slate-500">
            No archived months yet.
          </p>
        </div>
      ) : (
        reports
          .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          })
          .map((report) => (
            <div
              key={report.$id}
              className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] p-6"
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {new Date(
                      report.year,
                      report.month - 1
                    ).toLocaleString('default', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                  <Lock size={14} />
                  Sealed
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Income</p>
                  <h4 className="font-bold">
                    {currency}{report.income?.toLocaleString()}
                  </h4>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase">Expenses</p>
                  <h4 className="font-bold">
                    {currency}{report.expenses?.toLocaleString()}
                  </h4>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase">Savings</p>
                  <h4 className="font-bold">
                    {currency}{report.savings?.toLocaleString()}
                  </h4>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase">Balance</p>
                  <h4 className="font-bold">
                    {currency}{report.balance?.toLocaleString()}
                  </h4>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default ArchivePage;