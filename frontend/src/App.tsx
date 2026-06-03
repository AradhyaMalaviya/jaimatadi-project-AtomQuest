import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!currentUser) return <Navigate to="/" />;
  return <>{children}</>;
};

const DashboardRouter: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!currentUser) return <Navigate to="/" />;

  switch (currentUser.role) {
    case 'EMPLOYEE': return <EmployeeDashboard />;
    case 'MANAGER': return <ManagerDashboard />;
    case 'ADMIN': return <AdminDashboard />;
    default: return <Navigate to="/" />;
  }
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardRouter />} />
      </Route>
    </Routes>
  );
}

export default App;
