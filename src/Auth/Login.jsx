import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { account } from '../lib/appwrite';
import Swal from 'sweetalert2';

const Login = ({ setUser }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Logic Fix: Clear any ghost sessions to prevent "Session Active" error
      try {
        await account.deleteSession('current');
      } catch (err) { }

      // 1. Appwrite Login
      await account.createEmailPasswordSession(email, password);

      // 2. Get User Data
      const userDetails = await account.get();

      // Logic Fix: Update Global State
      if (setUser) {
        setUser(userDetails);
      }

      const destination = location.state?.from || '/dashboard';

      Swal.fire({
        title: 'Welcome Back!',
        text: `Logging you in, ${userDetails.name}...`,
        icon: 'success',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        navigate(destination);
      });
    } catch (error) {
      Swal.fire({
        title: 'Login Failed',
        text: error.message,
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#050b18] text-slate-900 dark:text-slate-100 font-sans min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500">
      <div className="w-full max-w-[440px] flex flex-col">
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <div className="w-5 h-5 border-2 border-white rounded-md flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">FinTrack</span>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-4xl font-extrabold leading-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-2">Securely access your budget manager</p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input
                placeholder="name@example.com"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-500">Forgot Password?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span className="text-lg">Log In</span><LogIn className="w-5 h-5" /></>}
          </button>
        </form>

        <p className="text-center mt-12 text-slate-500 font-medium">
          <Link to="/" className="text-blue-600 font-bold cursor-pointer hover:underline">Back to Home</Link>
        </p>

        <p className="text-center mt-4 text-slate-500 font-medium">
          Don't have an account? <Link to="/signup" className="text-blue-600 font-bold cursor-pointer hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;