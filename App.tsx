import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ToastContainer from './components/ui/ToastContainer';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AddTransactionPage from './pages/AddTransactionPage';
import ReportsPage from './pages/ReportsPage';
import CategoriesPage from './pages/CategoriesPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import { supabase } from './/supabaseClient';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // THIS IS THE CORRECTED CODE BLOCK
    const fetchSession = async () => {
      // 1. Use the new async getSession() method
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // Listen for changes in authentication state (login/logout)
    // 2. The listener now returns a `subscription` inside the data object
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup the listener when the component unmounts
    return () => {
      // 3. We call unsubscribe on the `subscription`
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return null; // Don't render anything until we have checked for a session
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <DataProvider>
          <HashRouter>
            <Routes>
              {!session ? (
                <>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              ) : (
                <Route path="/" element={<Layout onLogout={handleLogout} />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="add" element={<AddTransactionPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              )}
            </Routes>
          </HashRouter>
          <ToastContainer />
        </DataProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;