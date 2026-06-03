import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!currentUser) {
    return <div>Loading...</div>; // Should not happen since we protect routes, but good fallback
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#0056b3', color: 'white' }}>
        <div>
          <h2 style={{ margin: 0 }}>AtomQuest</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>{currentUser.name} | Role: {currentUser.role}</span>
          <button onClick={handleLogout} style={{ padding: '5px 10px' }}>Logout</button>
        </div>
      </header>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
