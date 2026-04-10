import React, { useState } from 'react';
import { account } from '../lib/appwrite'; // Your Appwrite setup
import { KeyRound, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords don't match!");

    // Appwrite automatically puts these in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const secret = urlParams.get('secret');

    try {
      setStatus('loading');
      await account.updateRecovery(userId, secret, password, confirmPassword);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#161f2e] border border-white/5 rounded-[3rem] p-10 shadow-2xl text-center">

        {status !== 'success' ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <KeyRound className="text-blue-500" size={35} />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Create New Password</h1>
            <p className="text-slate-500 text-xs">Secure your FinTrack account with a new password.</p>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full p-5 rounded-[2rem] bg-white/5 border-none text-white font-bold focus:ring-2 focus:ring-blue-500 pr-12"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                className="w-full p-5 rounded-[2rem] bg-white/5 border-none text-white font-bold focus:ring-2 focus:ring-blue-500 pr-12"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 p-5 rounded-[2rem] font-black text-white uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {status === 'loading' ? 'Syncing...' : 'Update Password'} <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <div className="animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase">Password Updated</h2>
            <p className="text-slate-500 text-xs mt-4">Your password has been updated successfully.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="mt-10 text-blue-500 font-black uppercase tracking-widest text-[10px]"
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