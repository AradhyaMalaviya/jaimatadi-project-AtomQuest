import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, users, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleLogin = async (userId: string) => {
    setError('');
    setSelectedUserId(userId);
    try {
      await login(userId);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSelectedUserId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h1>AtomQuest Goal Portal</h1>
      <h2>Select a User to Login</h2>
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {users.map(user => (
          <button 
            key={user.id} 
            onClick={() => handleLogin(user.id)}
            disabled={isLoading || selectedUserId !== null}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: isLoading || selectedUserId !== null ? 'wait' : 'pointer' }}
          >
            {selectedUserId === user.id ? 'Signing in...' : `Login as ${user.name} (${user.role})`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Login;
