
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import useLocalStorage from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      {isLoggedIn ? <DashboardLayout onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
    </div>
  );
};

export default App;
