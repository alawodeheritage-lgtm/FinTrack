import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { account } from "./lib/appwrite";
import { Loader2 } from "lucide-react";

// Import your components
import Home from "./Components/Home";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import Dashboard from "./Components/Dashboard";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/resetPassword";
import ProtectedRoute from "./ProtectedRoute";
import { PeriodProvider } from './context/PeriodContext';

function App() {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await account.get();
        setUser(session
        );
      } catch (error) {
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkUser();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#050b18] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 1. Landing Page: If logged in, go to dashboard. If not, show Home */}
        <Route
          path="/"
          element={!user ? <Home /> : <Navigate to="/dashboard" />}
        />

        {/* 2. Auth Routes: Only accessible if NOT logged in */}
        <Route
          path="/login"
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUp setUser={setUser} /> : <Navigate to="/login" />}
        />
        <Route
          path="/forgot-password"
          element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* 3. Protected Route: Only accessible if logged in */}
        <Route
          path="/dashboard"
          element={
            <PeriodProvider>
            <ProtectedRoute user={user}>
              <Dashboard user={user} setUser={setUser} />
            </ProtectedRoute>
               </PeriodProvider>
          }
        />

        {/* 4. Catch-all: Redirect unknown paths */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </Router>
  );
}

export default App;