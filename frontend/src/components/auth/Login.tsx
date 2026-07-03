import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <Shield size={40} color="#ffffff" />
        </div>

        <h1 className="login-title">
          Smart<span>Comply</span>
        </h1>
        <p className="login-subtitle">Transaction Monitoring Platform</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-input-wrapper">
            <Mail className="login-input-icon" size={18} />
            <input
              type="text"
              className="login-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-input-wrapper">
            <Lock className="login-input-icon" size={18} />
            <input
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-btn-spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="login-demo">Demo: admin / admin123 (create a superuser first)</p>
      </div>
    </div>
  );
}