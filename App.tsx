import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import { api } from './services/api';
import type { AuthUser } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<{ success: boolean; data: AuthUser }>('/api/auth/me');
        if (mounted) setUser(res.data);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLogin = (u: AuthUser) => {
    setUser(u);
  };

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    setUser(null);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">Loading...</div></div>;

  return (
    <div className="bg-slate-100 min-h-screen">
      {user ? <DashboardLayout user={user} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
    </div>
  );
};

export default App;
