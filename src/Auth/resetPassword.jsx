import React, { useState, useEffect } from 'react';
import { account } from '../lib/appwrite'; // Your Appwrite setup
import { KeyRound, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validLink, setValidLink] = useState(true); // New state to track link validity
  const [recoveryData, setRecoveryData] = useState({ userId: '', secret: '' });

  // Apply theme from Home page
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved ? saved === 'dark' : window.document.documentElement.classList.contains('dark');
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. Professional Link Validation
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const secret = urlParams.get('secret');

    if (!userId || !secret) {
      setValidLink(false); // If params are missing, hide the form
      return;
    }

    setRecoveryData({ userId, secret });
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords don't match!");
    if (password.length < 8) return alert('Password must be at least 8 characters long.');
    if (!/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) return alert('Use at least one number and one special character.');
    if (!recoveryData.userId || !recoveryData.secret) return alert('Recovery data is missing or invalid.');

    try {
      setStatus('loading');
      await account.updateRecovery(recoveryData.userId, recoveryData.secret, password, confirmPassword);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050b18] text-slate-900 dark:text-white font-sans flex items-center justify-center p-6 transition-colors duration-500">
      <div className="max-w-md w-full bg-white dark:bg-[#161f2e] border border-slate-200 dark:border-white/5 rounded-[2rem] p-10 shadow-2xl text-center">

        {!validLink ? (
          /* --- PROFESSIONAL ERROR STATE --- */
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-red-500 rotate-180" size={35} />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase">Invalid Link</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              This password reset link is invalid or has expired. Please request a new one from the login page.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-slate-900 dark:bg-white dark:text-black text-white p-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all"
            >
              Back to Login
            </button>
          </div>
        ) : status !== 'success' ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <KeyRound className="text-blue-600 dark:text-blue-500" size={35} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create New Password</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Secure your FinTrack account with a new password.</p>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full p-5 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 pr-12 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                className="w-full p-5 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 pr-12 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {status === 'loading' ? 'Syncing...' : 'Update Password'} <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <div className="animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Password Updated</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-4">Your password has been updated successfully.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="mt-10 text-blue-600 dark:text-blue-500 font-black uppercase tracking-widest text-[10px] hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;