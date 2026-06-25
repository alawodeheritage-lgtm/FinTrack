// src/context/PeriodContext.jsx
import React, { createContext, useContext, useState } from 'react';

const PeriodContext = createContext(null);

export const PeriodProvider = ({ children }) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [reportMode, setReportMode] = useState('monthly'); // 'monthly' | 'yearly'

  return (
    <PeriodContext.Provider value={{
      selectedMonth, setSelectedMonth,
      selectedYear, setSelectedYear,
      reportMode, setReportMode
    }}>
      {children}
    </PeriodContext.Provider>
  );
};

export const usePeriod = () => useContext(PeriodContext);