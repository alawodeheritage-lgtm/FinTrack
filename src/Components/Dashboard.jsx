import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, ID, Query } from '../lib/appwrite';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { usePeriod } from '../context/PeriodContext';
import MonthSelector from './MonthSelector';
import { useMonthlyStats } from '../hooks/useMonthlyStats';
import { useYearlyStats } from '../hooks/useYearlyStats';
import ArchivePage from './Archive';
import {
  LayoutDashboard, ReceiptText, Wallet as WalletIcon,
  BarChart3, User, Archive, Menu, X,
  LogOut, Loader2
} from 'lucide-react';

// Import modular components
import DashboardTab from './DashboardTab';
import Reports from './Reports';
import Transactions from './Transactions';
import UserProfile from './UserProfile';

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('privacyMode') === 'true';
  });

  // SECURE IDS FROM ENV
  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

  const currency = user?.prefs?.currency || "$";

  const categoryConfig = {
    Income: { bg: 'bg-emerald-500', color: '#10b981', label: 'Earnings' },
    Essential: { bg: 'bg-blue-500', color: '#0ea5e9', label: 'Bills/Needs' },
    Luxury: { bg: 'bg-orange-400', color: '#fb923c', label: 'Wants/Fun' },
    Savings: { bg: 'bg-purple-600', color: '#7c3aed', label: 'Future/Goal' },
    Withdrawal: { bg: 'bg-rose-500', color: '#f43f5e', label: 'Dip into Savings' }
  };


  // --- STATE ---
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Essential");
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [reports, setReports] = useState([]);

  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => setIsDarkMode(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('privacyMode', isPrivate.toString());
  }, [isPrivate]);

  const normalizeDocuments = (documents) => documents.map(doc => {
    const rawAmount = String(doc.amount ?? '0').replace(/[^0-9.-]/g, '');
    const amount = parseFloat(rawAmount);

    return {
      ...doc,
      amount: Number.isFinite(amount) ? amount : 0,
    };
  });

  const fetchData = useCallback(async () => {
    try {
      // Load the full set of user documents once so totals remain stable.
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.orderDesc("createdAt"),
          Query.limit(1000)
        ]
      );

      setExpenses(normalizeDocuments(response.documents));
      setIsLoading(false);
    } catch (error) {
      console.error("Cloud Fetch Error:", error);
      setIsLoading(false);
    }
  }, [DATABASE_ID, COLLECTION_ID, user]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      await fetchData();
      await fetchReports();
    };

    loadData();
  }, [user, fetchData]);

  const resetForm = () => {
    setName("");
    setAmount("");
    setCategory("Essential");
    setEditingId(null);
  };


  const REPORTS_COLLECTION_ID =
    import.meta.env.VITE_APPWRITE_MONTHLY_REPORTS_COLLECTION_ID;

  const fetchReports = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.limit(1000)
        ]
      );

      setReports(response.documents);

      console.log("Reports:", response.documents);
    } catch (error) {
      console.error("Failed to load reports:", error);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    const rawAmount = String(amount).replace(/[^0-9.-]/g, '');
    const numericAmount = parseFloat(rawAmount);

    if (!name || amount === '' || !Number.isFinite(numericAmount)) {
      Swal.fire({ icon: 'error', title: 'Invalid Entry', text: 'Please provide a valid amount.', background: isDarkMode ? '#161f2e' : '#fff', color: isDarkMode ? '#fff' : '#000' });
      return;
    }

    try {
      if (editingId) {
        await databases.updateDocument(DATABASE_ID, COLLECTION_ID, editingId, {
          title: name,
          amount: numericAmount,
          category: category
        });

        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Entry updated', showConfirmButton: false, timer: 1500 });
      } else {
        await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
          title: name,
          amount: numericAmount,
          category: category,
          userId: user.$id,
          createdAt: new Date().toISOString()
        });

        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Saved Successfully', showConfirmButton: false, timer: 1500 });
      }

      resetForm();
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  // 1. DELETE FUNCTION
  // Line 171 (Approx)
  const handleDelete = async (id) => {
    const isClosedPeriod = reports.some(
      r =>
        r.month === transactionMonth &&
        r.year === transactionYear &&
        r.isClosed
    );

    if (isClosedPeriod) {
      Swal.fire({
        icon: 'error',
        title: 'Period Locked',
        text: 'This accounting period has been sealed.'
      });

      return;
    }
    const result = await Swal.fire({
      title: 'Delete?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      background: isDarkMode ? '#161f2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // Line 181 - The "await" is now safely inside an "async" function
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
        fetchData();
        if (editingId === id) resetForm();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted successfully',
          showConfirmButton: false,
          timer: 2000,
          background: isDarkMode ? '#161f2e' : '#fff',
          color: isDarkMode ? '#fff' : '#000'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Delete failed',
          text: error.message,
          background: isDarkMode ? '#161f2e' : '#fff',
          color: isDarkMode ? '#fff' : '#000'
        });
      }
    }
  };


  const handleEdit = (item) => {
    const isClosedPeriod = reports.some(
      r =>
        r.month === transactionMonth &&
        r.year === transactionYear &&
        r.isClosed
    );

    if (isClosedPeriod) {
      Swal.fire({
        icon: 'error',
        title: 'Period Locked',
        text: 'This accounting period has been sealed.'
      });

      return;
    }
    setName(item.title || "");
    setAmount(item.amount?.toString() || "");
    setCategory(item.category || "Essential");
    setEditingId(item.$id);
    setActiveTab('Dashboard');
  };

  const handleExportFinancialAudit = () => {
    const doc = new jsPDF();
    const actualExpenses = typeof expenses !== 'undefined' ? expenses : [];

    // --- 1. THE NAVY HEADER (UI Kept Intact) ---
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFontSize(24).setTextColor(255, 255, 255).setFont(undefined, 'bold');
    doc.text("FINTRACK FINANCIAL AUDIT", 14, 25);
    doc.setFontSize(10).setFont(undefined, 'normal').setTextColor(200, 200, 200);
    doc.text(`Official Ledger Analysis: ${user.name.toUpperCase()}`, 14, 35);

    // --- 2. THE SUMMARY BOXES (UI Kept Intact) ---
    const surplus = totalIncome - totalSpent;

    doc.setFillColor(240, 249, 255).roundedRect(14, 55, 60, 25, 3, 3, 'F');
    doc.setFontSize(12).setTextColor(16, 185, 129).setFont(undefined, 'bold').text(`${currency}${totalIncome.toLocaleString()}`, 18, 72);

    doc.setFillColor(254, 242, 242).roundedRect(78, 55, 60, 25, 3, 3, 'F');
    doc.setTextColor(244, 63, 94).text(`${currency}${totalSpent.toLocaleString()}`, 82, 72);

    doc.setFillColor(240, 253, 244).roundedRect(142, 55, 54, 25, 3, 3, 'F');
    doc.setTextColor(30, 41, 59).text(`${currency}${surplus.toLocaleString()}`, 146, 72);

    // --- 3. THE BAR CHART (Using doc.rect for stability) ---
    const totals = {};
    actualExpenses.forEach(item => {
      totals[item.category] = (totals[item.category] || 0) + item.amount;
    });

    const categories = Object.keys(totals);
    const values = Object.values(totals);
    const maxValue = Math.max(...values, 1);

    doc.setFontSize(14).setTextColor(30, 41, 59).text("Spending Analysis by Category", 14, 95);

    const chartBaseY = 160;
    const chartHeight = 50;
    const barWidth = 25;
    const gap = 15;

    categories.forEach((cat, index) => {
      const barVal = (totals[cat] / maxValue) * chartHeight;
      const xPos = 30 + (index * (barWidth + gap));

      const hex = categoryConfig[cat]?.color || '#64748b';
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      doc.setFillColor(r, g, b);
      doc.rect(xPos, chartBaseY - barVal, barWidth, barVal, 'F');

      doc.setFontSize(8).setTextColor(100).text(cat.toUpperCase(), xPos + (barWidth / 2), chartBaseY + 5, { align: 'center' });
      doc.setFontSize(8).setTextColor(30).text(`${currency}${totals[cat].toLocaleString()}`, xPos + (barWidth / 2), chartBaseY - barVal - 3, { align: 'center' });
    });

    // --- 4. DATA TABLE (Clean & Professional) ---
    autoTable(doc, {
      startY: 180,
      head: [['Category', 'Total Spent', 'Weight (%)']],
      body: Object.entries(totals).map(([cat, val]) => [
        cat.toUpperCase(),
        `${currency}${val.toLocaleString()}`,
        `${((val / (totalIncome || 1)) * 100).toFixed(1)}%`
      ]),
      headStyles: { fillColor: [15, 23, 42] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          const catName = Object.keys(totals)[data.row.index];
          const hex = categoryConfig[catName]?.color || '#64748b';
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          data.cell.styles.textColor = [r, g, b];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    doc.save(`FinTrack_Audit_${user.name}.pdf`);
  };

  const handleExportCSV = () => {
    // 1. Updated Headers: No Category
    let rows = [["DATE", "DESCRIPTION", "TYPE", "AMOUNT"]];

    // 2. Process Incomes
    incomeItems.forEach(i => {
      rows.push([
        new Date(i.$createdAt).toLocaleDateString(),
        i.title,
        "INCOME",
        i.amount
      ]);
    });

    // 3. Process Expenses (using 'expenses' variable)
    const actualExpenses = typeof expenses !== 'undefined' ? expenses : [];

    actualExpenses.forEach(e => {
      rows.push([
        new Date(e.$createdAt).toLocaleDateString(),
        e.title,
        "EXPENSE",
        e.amount
      ]);
    });

    // 4. Create and Download the File
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinTrack_Backup_${user.name}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
  };
  // if (result.isConfirmed) {
  //   try {
  //     await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
  //     fetchData();
  //     Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Deleted successfully', showConfirmButton: false, timer: 2000 });
  //   } catch (error) {
  //     Swal.fire({ icon: 'error', title: 'Delete failed', text: error.message });
  //   }
  // }

  const handleLogout = async () => {
    await account.deleteSession('current');
    setUser(null);
    navigate('/login');
  };

  // --- CALCULATIONS ---
  const incomeItems = expenses.filter(
    e => e.category === 'Income'
  );

  const totalIncome = incomeItems.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  const totals = useMemo(() => {
    // Filter all entries by category
    const essential = expenses.filter(e => e.category === 'Essential').reduce((acc, curr) => acc + curr.amount, 0);
    const luxury = expenses.filter(e => e.category === 'Luxury').reduce((acc, curr) => acc + curr.amount, 0);

    // LOGIC: Savings = deposits minus withdrawals
    const savingsDeposits = expenses.filter(e => e.category === 'Savings').reduce((acc, curr) => acc + curr.amount, 0);
    const withdrawals = expenses.filter(e => e.category === 'Withdrawal').reduce((acc, curr) => acc + curr.amount, 0);

    return {
      Essential: essential,
      Luxury: luxury,
      Savings: savingsDeposits - withdrawals // This is your "Net Savings"
    };
  }, [expenses]);

  const totalForPie = totals.Essential + totals.Luxury + Math.max(0, totals.Savings);

  // Projection Math: If you keep saving this much every month...
  const monthlySavings = totals.Savings > 0 ? totals.Savings : 0;
  const yearlyProjection = monthlySavings * 12;
  const fiveYearProjection = monthlySavings * 60; // 5 years


  const allocationData = {
    essential: totalForPie > 0 ? (totals.Essential / totalForPie) * 100 : 33,
    luxury: totalForPie > 0 ? (totals.Luxury / totalForPie) * 100 : 33,
    savings: totalForPie > 0 ? (Math.max(0, totals.Savings) / totalForPie) * 100 : 34,
  };
  // const safetyNet = useMemo(() => {
  //   if (totals.Essential === 0) return 0;
  //   // Math: Total Saved / Monthly Needs
  //   const months = totals.Savings / totals.Essential;
  //   return months.toFixed(1); // Returns 1.5, 2.0, etc.
  // }, [totals.Savings, totals.Essential]);

  const totalSpent = useMemo(() => totals.Essential + totals.Luxury, [totals]);
  const remainingBalance = useMemo(() => {
    const totalWithdrawals = expenses.filter(e => e.category === 'Withdrawal').reduce((acc, curr) => acc + curr.amount, 0);
    const totalSavingsDeposits = expenses.filter(e => e.category === 'Savings').reduce((acc, curr) => acc + curr.amount, 0);

    // Formula: (Earned Income + Money taken back from Savings) - (All Spending + Money sent to Savings)
    return (totalIncome + totalWithdrawals) - (totals.Essential + totals.Luxury + totalSavingsDeposits);
  }, [totalIncome, totals, expenses]);


  const efficiency = totalIncome > 0
    ? Math.round((totals.Savings / totalIncome) * 100)
    : 0;

  // --- PRO INSIGHT LOGIC (Updated for 20%+) ---
  const proInsight = useMemo(() => {
    if (totalIncome === 0) return "Add your income to start analysis.";

    const savingsPercent = Math.round((totals.Savings / totalIncome) * 100);
    const luxuryOverhead = totals.Luxury > totals.Essential;
    const highSpending = efficiency > 80;
    const goodSavings = savingsPercent >= 20;

    if (highSpending) return "Warning: Spending is very high compared to income.";
    if (luxuryOverhead) return "Insight: Your Luxury spending exceeds your Essentials.";

    // NEW LOGIC: Check if they are ABOVE the 20% rule
    if (savingsPercent > 20) {
      const extra = savingsPercent - 20;
      return `Incredible! You are ${extra}% above the 20% savings rule.`;
    }

    if (goodSavings) return "Excellent! You are hitting the 20% savings rule.";

    return "Your financial health is currently stable.";
  }, [totalIncome, totals.Luxury, totals.Essential, totals.Savings, efficiency]);

  //   const {
  //   selectedMonth,
  //   selectedYear
  // } = usePeriod();
  // console.log(selectedMonth, selectedYear);
  // console.log("MonthSelector:", selectedMonth, selectedYear);

  // const stats = useMonthlyStats(
  //   expenses,
  //   selectedMonth,
  //   selectedYear
  // );

  // console.log(stats.transactions);

  const { selectedMonth, selectedYear } = usePeriod();

  const stats = useMonthlyStats(
    expenses,
    selectedMonth,
    selectedYear
  );
  // console.log("Old Income:", totalIncome);
  // console.log("New Income:", stats.income);

  // console.log("Old Spent:", totalSpent);
  // console.log("New Spent:", stats.totalSpent);

  // console.log("Old Balance:", remainingBalance);
  // console.log("New Balance:", stats.balance);

  // console.log("Old Efficiency:", efficiency);
  // console.log("New Efficiency:", stats.retentionScore);
  // console.log("Selected Month:", selectedMonth);
  // console.log("Selected Year:", selectedYear);

  // console.log(
  //   "Monthly Transactions:",
  //   stats.transactions.length
  // );
  // console.log(
  //   expenses.length
  // );

  const yearlyStats = useYearlyStats(
    expenses,
    selectedYear
  );

  const safetyNet = useMemo(() => {
    if (stats.essential === 0) return 0;

    return (
      stats.netSavings / stats.essential
    ).toFixed(1);
  }, [stats]);
  const filteredTransactions = useMemo(() => {
    let result = expenses.filter(item =>
      item.category !== 'Income' &&
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCat === "All" || item.category === filterCat)
    );

    result.sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [expenses, searchQuery, filterCat, sortBy]);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Reports', icon: <BarChart3 size={20} /> },
    { name: 'Transactions', icon: <ReceiptText size={20} /> },
    { name: 'Profile', icon: <User size={20} /> },
    {
      name: 'Archive', icon: <Archive size={20} />
    }
  ];

  if (isLoading) return <div className="min-h-screen bg-slate-50 dark:bg-[#0b121f] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b121f] text-slate-600 dark:text-slate-300 transition-colors duration-500">

      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-white/5 flex-col p-6 sticky top-0 h-screen bg-white dark:bg-[#0b121f]">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20"><WalletIcon size={24} /></div>
          <h1 className="text-slate-900 dark:text-white font-bold text-lg">FinTrack</h1>
        </div>
        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}>
              {item.icon} {item.name}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold transition-all">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <main className="flex-grow flex flex-col w-full">
        <header className="h-20 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 lg:px-8 bg-white/80 dark:bg-[#0b121f]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(true)}><Menu /></button>
            {/* <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeTab}</h2> */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeTab}
            </h2>

            <MonthSelector />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all" onClick={() => setActiveTab('Profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                <p className="text-[10px] text-blue-500 font-medium mt-1 uppercase tracking-tighter">Pro Plan</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold border border-white/10 shadow-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <section className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {activeTab === 'Dashboard' && (
            <DashboardTab
              currency={currency}
              categoryConfig={categoryConfig}
              totalIncome={stats.income}
              remainingBalance={stats.balance}
              totals={{
                Essential: stats.essential,
                Luxury: stats.luxury,
                Savings: stats.netSavings
              }}
              yearlyIncome={yearlyStats.income}
              selectedYear={selectedYear}
              name={name}
              setName={setName}
              amount={amount}
              setAmount={setAmount}
              category={category}
              setCategory={setCategory}
              editingId={editingId}
              resetForm={resetForm}
              handleAddEntry={handleAddEntry}
              efficiency={stats.retentionScore}
              safetyNet={safetyNet}
              isPrivate={isPrivate}
              setIsPrivate={setIsPrivate}
            />
          )}

          {activeTab === 'Reports' && (
            <Reports
              currency={currency}
              categoryConfig={categoryConfig}
              totals={{
                Essential: stats.essential,
                Luxury: stats.luxury,
                Savings: stats.netSavings
              }}
              allocationData={allocationData}
              efficiency={stats.retentionScore}
              yearlyProjection={yearlyProjection}
              fiveYearProjection={fiveYearProjection}
              proInsight={proInsight}
              isPrivate={isPrivate}
              allExpenses={expenses}
            />
          )}

          {activeTab === 'Transactions' && (
            <Transactions
              currency={currency}
              isPrivate={isPrivate}
              allExpenses={expenses}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          )}

          {activeTab === 'Profile' && (
            <UserProfile
              user={user}
              currency={currency}
              totalIncome={stats.income}
              totalSpent={stats.totalSpent}
              efficiency={stats.retentionScore}
              incomeItems={incomeItems}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleExportFinancialAudit={handleExportFinancialAudit}
              handleExportCSV={handleExportCSV}
              handleLogout={handleLogout}
              setActiveTab={setActiveTab}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              existingReports={reports}
              onRefreshReports={fetchReports}
              monthlySavings={stats.netSavings}   // <-- ADD THIS
              isPrivate={isPrivate}
            />
          )}
          {activeTab === 'Archive' && (
            <ArchivePage
              reports={reports}
              currency={currency}
            />
          )}
        </section>

      </main>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#0b121f] p-6 flex flex-col animate-in slide-in-from-left duration-300 lg:hidden">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-slate-900 dark:text-white font-bold text-xl">FinTrack</h1>
            <X className="text-slate-500 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
          <nav className="space-y-4">
            {navItems.map((item) => (
              <button key={item.name} onClick={() => { setActiveTab(item.name); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold ${activeTab === item.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500'}`}>
                {item.icon} {item.name}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold text-rose-500 mt-auto"><LogOut size={20} /> Logout</button>
          </nav>
        </div>
      )}
    </div>
  );
}
export default Dashboard;
