import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, ID, Query } from '../lib/appwrite';
import Swal from 'sweetalert2';
import {
  LayoutDashboard, ReceiptText, Wallet as WalletIcon,
  BarChart3, Settings, Search, Bell, Plus, Trash2,
  Home, Utensils, TrendingUp, Bus, ChevronDown, Send, Menu, X,
  PieChart as PieIcon, User, LogOut, Loader2, ArrowUpDown, Filter, Sparkles
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
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
        fetchData();
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Deleted successfully', showConfirmButton: false, timer: 2000 });
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Delete failed', text: error.message });
      }
    }
  };

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

  const totals = useMemo(() => ({
    Essential: expenses.filter(e => e.category === 'Essential').reduce((acc, curr) => acc + curr.amount, 0),
    Luxury: expenses.filter(e => e.category === 'Luxury').reduce((acc, curr) => acc + curr.amount, 0),
    Savings: expenses.filter(e => e.category === 'Savings').reduce((acc, curr) => acc + curr.amount, 0),
  }), [expenses]);

  const totalSpent = useMemo(() => totals.Essential + totals.Luxury, [totals]);
  const remainingBalance = totalIncome - totalSpent - totals.Savings;

  const efficiency = useMemo(() => {
    return totalIncome > 0 ? Math.min(Math.round((totalSpent / totalIncome) * 100), 100) : 0;
  }, [totalIncome, totalSpent]);

  // --- PRO INSIGHT LOGIC ---
  const proInsight = useMemo(() => {
    // 1. If no income has been added yet
    if (totalIncome === 0) return "Add your income to start analysis.";

    // 2. Logic checks
    const luxuryOverhead = totals.Luxury > totals.Essential;
    const highSpending = efficiency > 80;
    const goodSavings = totals.Savings >= (totalIncome * 0.2);

    // 3. Return priority message
    if (highSpending) return "Warning: Spending is very high compared to income.";
    if (luxuryOverhead) return "Insight: Your Luxury spending exceeds your Essentials.";
    if (goodSavings) return "Excellent! You are hitting the 20% savings rule.";

    return "Your financial health is currently stable.";
  }, [totalIncome, totals.Luxury, totals.Essential, totals.Savings, efficiency]);
  // Note: We put the specific properties (totals.Luxury, etc.) in the dependency array
  // to make sure React definitely triggers the update.

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
              <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Income</label>
                    <div className="w-full bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-2xl font-bold text-slate-900 dark:text-white">
                      {currency}{totalIncome.toLocaleString()}
                    </div>

                    {/* Ensure this line exists and isn't being overwritten */}
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

              <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-md font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-500" /> Quick Entry</h3>
                <form onSubmit={handleAddEntry} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" />
                  <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" />
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-slate-50 dark:bg-[#0b121f] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none">
                    <option value="Income">Income</option>
                    <option value="Essential">Essential</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Savings">Savings</option>
                  </select>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-3 flex justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"><Send size={16} /> Add</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'Reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
              <div className="lg:col-span-2 bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-10 flex items-center gap-2 text-lg"><PieIcon className="text-blue-500" size={22} /> Spending Analysis</h3>
                <div className="flex items-end justify-around h-72 gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                  {['Essential', 'Luxury', 'Savings'].map((cat) => {
                    const val = totals[cat];
                    const max = Math.max(totals.Essential, totals.Luxury, totals.Savings, 1);
                    const height = (val / max) * 100;
                    return (
                      <div key={cat} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                        <div className={`w-full max-w-[80px] rounded-t-2xl transition-all duration-1000 relative ${cat === 'Essential' ? 'bg-blue-500' : cat === 'Luxury' ? 'bg-orange-400' : 'bg-emerald-500'}`} style={{ height: `${height}%` }}>
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-2xl">{currency}{val.toLocaleString()}</div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-black mt-6 uppercase tracking-widest">{cat}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="relative w-32 h-32 mb-6">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-slate-100 dark:text-white/5" strokeDasharray="100, 100" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-blue-500 transition-all duration-1000" strokeDasharray={`${efficiency}, 100`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-slate-900 dark:text-white">{efficiency}%</div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Efficiency Gauge</h4>
                <p className="text-xs text-slate-500 mt-2 font-medium">Spending vs Income Ratio</p>
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
};

export default Dashboard;