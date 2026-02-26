import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Globe, Loader2 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { account, ID } from '../lib/appwrite';
import Swal from 'sweetalert2';

const SignUp = ({ setUser }) => { // Logic: Added setUser prop
  const [showPassword, setShowPassword] = useState(false);
  const [nationality, setNationality] = useState("United States");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const countryData = [
    { name: "Nigeria", symbol: "₦" },
    { name: "United States", symbol: "$" },
    { name: "United Kingdom", symbol: "£" },
    { name: "Ghana", symbol: "GH₵" },
    { name: "Kenya", symbol: "KSh" },
    { name: "South Africa", symbol: "R" },
    { name: "India", symbol: "₹" },
    { name: "Europe (General)", symbol: "€" },
    { name: "Canada", symbol: "CA$" },
    { name: "UAE", symbol: "د.إ" },
    { name: "Japan", symbol: "¥" },
    { name: "China", symbol: "元" },
    { name: "Australia", symbol: "A$" },
    { name: "Singapore", symbol: "S$" },
    { name: "Egypt", symbol: "EGP" },
    { name: "Tanzania", symbol: "TZS" },
    { name: "Uganda", symbol: "UGX" },
    { name: "Rwanda", symbol: "RWF" },
    { name: "Zambia", symbol: "ZMW" },
    { name: "Cameroon", symbol: "CFA" },
    { name: "Senegal", symbol: "CFA" },
    { name: "Ivory Coast", symbol: "CFA" },
    { name: "Morocco", symbol: "MAD" },
    { name: "Pakistan", symbol: "₨" },
    { name: "Brazil", symbol: "R$" }
  ];

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Logic Fix: Clear ghost sessions to prevent "Session Active" error
      try {
        await account.deleteSession('current');
      } catch (err) { }

      // 1. Create the Appwrite Account
      await account.create(ID.unique(), email, password, fullName);

      // 2. Create Session
      await account.createEmailPasswordSession(email, password);

      // 3. Get User Data immediately
      const userDetails = await account.get();

      // 4. Update Preferences
      const selectedCountry = countryData.find(c => c.name === nationality);
      const userCurrency = selectedCountry ? selectedCountry.symbol : "$";

      await account.updatePrefs({
        currency: userCurrency,
        nationality: nationality
      });

      // Logic Fix: Tell the app the user is officially logged in
      if (setUser) {
        setUser(userDetails);
      }

      Swal.fire({
        title: 'Account Created!',
        text: `Welcome to FinTrack! Your currency is set to ${userCurrency}.`,
        icon: 'success',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Go to Dashboard'
      }).then(() => {
        navigate('/dashboard');
      });

    } catch (error) {
      Swal.fire({
        title: 'Signup Failed',
        text: error.message,
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#050b18] text-slate-900 dark:text-slate-50 flex flex-col items-center px-6 py-12 font-sans transition-colors duration-500">
      <header className="flex flex-col items-center gap-4 mb-10">
        <div className="bg-[#2563eb] p-3 rounded-2xl shadow-xl shadow-blue-600/30">
          <div className="w-8 h-8 border-[3px] border-white rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">FinTrack</span>
      </header>

      <div className="text-center space-y-3 mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-[280px] mx-auto leading-relaxed">Join FinTrack to start managing your finances more effectively today.</p>
      </div>

      <form className="w-full max-w-[440px] space-y-5" onSubmit={handleSignUp}>
        <div className="space-y-2">
          <label className="text-slate-600 dark:text-slate-300 ml-1 block uppercase tracking-wide text-[11px] font-bold">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text" placeholder="John Doe" required disabled={isLoading}
              value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1e293b]/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-slate-600 dark:text-slate-300 ml-1 block uppercase tracking-wide text-[11px] font-bold">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="email" placeholder="name@example.com" required disabled={isLoading}
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1e293b]/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-slate-600 dark:text-slate-300 ml-1 block uppercase tracking-wide text-[11px] font-bold">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type={showPassword ? "text" : "password"} placeholder="••••••••" required disabled={isLoading}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1e293b]/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-slate-600 dark:text-slate-300 ml-1 block uppercase tracking-wide text-[11px] font-bold">Nationality / Region</label>
          <div className="relative group">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
            <select
              value={nationality} onChange={(e) => setNationality(e.target.value)} disabled={isLoading}
              className="w-full bg-slate-50 dark:bg-[#1e293b]/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 appearance-none cursor-pointer text-slate-900 dark:text-white relative transition-all"
            >
              {countryData.map((country) => (
                <option key={country.name} value={country.name} className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">
                  {country.name} ({country.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] mt-6 disabled:opacity-70">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span className="text-lg">Sign up</span><UserPlus className="w-5 h-5" /></>}
        </button>
      </form>

      <p className="mt-auto pt-10 text-slate-500 text-sm font-medium">Already have an account? <Link to="/login" className="text-[#2563eb] font-bold hover:underline">Log In</Link></p>
    </div>
  );
};

export default SignUp;