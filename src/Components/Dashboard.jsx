import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, ID, Query, storage } from '../lib/appwrite';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LayoutDashboard, ReceiptText, Wallet as WalletIcon,
  BarChart3, Zap, /* Add this one*/ Settings, Search, FileText, Bell, Plus, Trash2,
  Home, Utensils, TrendingUp, Bus, ChevronDown, Send, Menu, X,
  PieChart as PieIcon, User, LogOut, Loader2, ArrowUpDown, ShieldCheck, // <--- Add this
  Database, CloudDownload, Sparkles
} from 'lucide-react';

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => setIsDarkMode(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("userId", user.$id), Query.orderDesc("createdAt")]
      );
      setExpenses(response.documents);
    } catch (error) {
      console.error("Cloud Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!name || !amount) {
      Swal.fire({ icon: 'error', title: 'Empty Fields', text: 'Please provide a name and amount.', background: isDarkMode ? '#161f2e' : '#fff', color: isDarkMode ? '#fff' : '#000' });
      return;
    }

    try {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        title: name,
        amount: parseFloat(amount),
        category: category,
        userId: user.$id,
        createdAt: new Date().toISOString()
      });
      setName(""); setAmount("");
      fetchData();
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Saved Successfully', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  // 1. DELETE FUNCTION
  // Line 171 (Approx)
  const handleDelete = async (id) => {
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

  const handleUploadReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      Swal.fire({
        title: 'Uploading...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        background: isDarkMode ? '#161f2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000'
      });

      // Using the Appwrite storage service
      await storage.createFile(
        import.meta.env.VITE_APPWRITE_STORAGE_ID,
        ID.unique(),
        file
      );

      Swal.fire({
        icon: 'success',
        title: 'Receipt Vaulted',
        text: 'Your document is securely stored.',
        background: isDarkMode ? '#161f2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.message,
        background: isDarkMode ? '#161f2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000'
      });
    }
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

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isAlertsEnabled, setIsAlertsEnabled] = useState(true);

  const handleLogout = async () => {
    await account.deleteSession('current');
    setUser(null);
    navigate('/login');
  };

  // --- CALCULATIONS ---
  const incomeItems = useMemo(() => expenses.filter(e => e.category === 'Income'), [expenses]);

  const totalIncome = useMemo(() =>
    incomeItems.reduce((acc, curr) => acc + curr.amount, 0),
    [incomeItems]);

  const totals = useMemo(() => {
    // Filter all entries by category
    const essential = expenses.filter(e => e.category === 'Essential').reduce((acc, curr) => acc + curr.amount, 0);
    const luxury = expenses.filter(e => e.category === 'Luxury').reduce((acc, curr) => acc + curr.amount, 0);

    // LOGIC: Savings = (All Money put IN) minus (All Money taken OUT)
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
  const safetyNet = useMemo(() => {
    if (totals.Essential === 0) return 0;
    // Math: Total Saved / Monthly Needs
    const months = totals.Savings / totals.Essential;
    return months.toFixed(1); // Returns 1.5, 2.0, etc.
  }, [totals.Savings, totals.Essential]);

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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeTab}</h2>
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              {/* INCOME & SAVINGS TOP CARD */}
              <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Income</label>
                    <div className="w-full bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-2xl font-bold text-slate-900 dark:text-white">
                      {currency}{totalIncome.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 px-1">
                      <Sparkles size={12} className="text-blue-500" />
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">
                        {proInsight}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl text-center">
                      <p className="text-emerald-600 text-[10px] font-black uppercase">Balance</p>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{currency}{remainingBalance.toLocaleString()}</h4>
                    </div>
                    <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl text-center">
                      <p className="text-blue-600 text-[10px] font-black uppercase">Savings</p>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{currency}{totals.Savings.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: TWO-COLUMN GRID FOR ENTRY AND SAFETY NET */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* QUICK ENTRY FORM (Takes 2/3 of space) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-500" /> Quick Entry</h3>
                  <form onSubmit={handleAddEntry} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" />
                    <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" />
                    <div className="relative flex items-center">
                      {/* THIS IS THE NEW PART: A small colored circle that reacts to your choice */}
                      <div className={`absolute left-3 w-2 h-2 rounded-full transition-all ${categoryConfig[category]?.bg || 'bg-slate-400'}`}></div>

                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-xl p-3 pl-8 text-sm outline-none dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="Essential">Essential</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Savings">Savings</option>
                        <option value="Withdrawal">Withdrawal</option>
                        <option value="Income">Income</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-3 flex justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"><Send size={16} /> Add</button>
                  </form>
                </div>

                {/* FINANCIAL RUNWAY CARD (Takes 1/3 of space) */}
                <div className="bg-white dark:bg-[#161f2e] p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financial Runway</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">
                      {safetyNet} <span className="text-sm font-medium opacity-50 uppercase">Months</span>
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                        style={{ width: `${Math.min((parseFloat(safetyNet) / 6) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[9px] mt-2 opacity-50 font-bold uppercase tracking-tighter">
                      Target: 6 Months Safety
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">

              {/* LEFT: SPENDING BARS & PIE DISTRIBUTION */}
              <div className="lg:col-span-2 bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 flex flex-col shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-10 flex items-center gap-2 text-lg">
                  <BarChart3 className="text-blue-500" size={22} /> Spending Analysis
                </h3>

                {/* YOUR ORIGINAL BARS */}
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

              {/* RIGHT: WEALTHINTELLIGENCE AI (Upgraded) */}
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

                  {/* NEW: STATUS MONITOR */}
                  <div className="w-full space-y-4 mb-8">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-70">
                      <span>Monthly Target</span>
                      <span>{currency}20,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min(efficiency, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* THE AI INSIGHT & PROJECTION */}
                  <div className="mt-auto w-full space-y-6">

                    {/* FUTURE FORECAST BOX */}
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
                      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">1-Year Forecast</span>
                        <span className="text-lg font-black">{currency}{yearlyProjection.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">5-Year Growth</span>
                        <span className="text-lg font-black text-emerald-300">{currency}{fiveYearProjection.toLocaleString()}*</span>
                      </div>

                      <p className="text-[8px] font-medium opacity-40 mt-3 text-center uppercase tracking-tighter italic">
                        *Based on current {efficiency}% retention rate
                      </p>
                    </div>

                    {/* THE AI INSIGHT TEXT */}
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
          )}

          {activeTab === 'Transactions' && (
            <div className="space-y-6 pb-10 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-grow sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-sm" />
                  </div>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 outline-none shadow-sm cursor-pointer">
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="category">Category</option>
                  </select>
                  <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 outline-none shadow-sm cursor-pointer">
                    <option value="All">All Categories</option><option value="Essential">Essential</option><option value="Luxury">Luxury</option><option value="Savings">Savings</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {filteredTransactions.map((item) => (
                  <div key={item.$id} className="group flex items-center justify-between bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 p-5 rounded-2xl hover:border-blue-500/30 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 dark:bg-[#0b121f] p-3 rounded-xl text-blue-500">
                        {item.category === 'Essential' ? <Bus /> : item.category === 'Luxury' ? <Utensils /> : <TrendingUp />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm lg:text-base">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.category} • {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">-{currency}{item.amount.toLocaleString()}</span>
                      <button onClick={() => handleDelete(item.$id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Profile' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-10">
              {/* USER HEADER CARD - UNCHANGED */}
              <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-600/20">
                      {user.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white dark:border-[#161f2e] w-8 h-8 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white">{user.name}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-600 border border-blue-600/20 w-fit mx-auto md:mx-0">
                        Pro Member
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* STATS STRIP - UNCHANGED */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Income', val: totalIncome, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                  { label: 'Total Expenses', val: totalSpent, color: 'text-rose-500', bg: 'bg-rose-500/5' },
                  { label: 'Saved Ratio', val: `${100 - efficiency}%`, color: 'text-blue-500', bg: 'bg-blue-500/5' }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} border border-slate-200 dark:border-white/5 p-6 rounded-[2rem] text-center`}>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
                    <h4 className={`text-xl font-black ${stat.color}`}>
                      {typeof stat.val === 'number' ? `${currency}${stat.val.toLocaleString()}` : stat.val}
                    </h4>
                  </div>
                ))}
              </div>

              {/* REVENUE STREAMS - UNCHANGED */}
              <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">Revenue Streams</h4>
                    <p className="text-xs text-slate-500 font-medium">Manage your incoming cloud data</p>
                  </div>
                  <button onClick={() => setActiveTab('Dashboard')} className="p-2 rounded-xl bg-slate-50 dark:bg-[#0b121f] text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Plus size={20} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incomeItems.map(source => (
                    <div key={source.$id} className="group flex justify-between items-center p-5 bg-slate-50 dark:bg-[#0b121f] rounded-[1.5rem] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600"><TrendingUp size={18} /></div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{source.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-emerald-600 font-black">+{currency}{source.amount.toLocaleString()}</span>
                        <button onClick={() => handleDelete(source.$id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEW: ADVANCED INTEGRATIONS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Security & Alerts */}
                <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Sparkles size={18} className="text-blue-500" /> FinTrack Intelligence</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0b121f] rounded-2xl border border-slate-200 dark:border-white/5">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Smart Push Alerts</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Notify on high spending</p>
                      </div>
                      <button onClick={() => setIsAlertsEnabled(!isAlertsEnabled)} className={`w-10 h-5 rounded-full transition-all relative ${isAlertsEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAlertsEnabled ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0b121f] rounded-2xl border border-slate-200 dark:border-white/5">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">2FA Security</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Biometric/Cloud Auth</p>
                      </div>
                      <button onClick={() => setIs2FAEnabled(!is2FAEnabled)} className={`w-10 h-5 rounded-full transition-all relative ${is2FAEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${is2FAEnabled ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reports & Documents */}
                <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <WalletIcon size={18} className="text-blue-500" /> Vault & Data
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* BUTTON 1: THE AUDIT */}
                    <button
                      onClick={handleExportFinancialAudit}
                      className="flex flex-col items-center justify-center p-6 bg-blue-600/5 hover:bg-blue-600/10 border border-blue-500/10 rounded-[2rem] transition-all group"
                    >
                      <ShieldCheck className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" size={28} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Generate Audit</span>
                    </button>
                    {/* BUTTON 2: THE BACKUP */}
                    <button
                      onClick={handleExportCSV}
                      className="flex flex-col items-center justify-center p-6 bg-amber-600/5 hover:bg-amber-600/10 border border-amber-500/10 rounded-[2rem] transition-all group"
                    >
                      <CloudDownload className="text-amber-500 mb-2 group-hover:scale-110 transition-transform" size={28} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        ExportCSV
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SESSION MANAGEMENT - UNCHANGED */}
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="text-center md:text-left">
                  <h4 className="font-bold text-rose-500 text-lg mb-1">Session Management</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Sign out to clear your local session and protect your cloud data.</p>
                </div>
                <button onClick={handleLogout} className="w-full md:w-auto px-10 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2">
                  <LogOut size={18} /> Secure Logout
                </button>
              </div>
            </div>
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