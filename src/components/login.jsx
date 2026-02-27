import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';

const API = 'http://localhost:5000';

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1️⃣ Quick health check so we can give a specific error
      const health = await fetch(`${API}/api/health`).catch(() => null);
      if (!health || !health.ok) {
        setError(
          'Cannot reach the server. Make sure you have run:\n  npm install\n  node server.js\n(in the project root, on port 5000)'
        );
        setLoading(false);
        return;
      }

      // 2️⃣ Actual login request
      const res  = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name || email.split('@')[0]);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setError(
        'Cannot reach the server. Make sure you have run:\n  npm install\n  node server.js'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-logo">
          <div className="logo-icon"></div>
          <span className="brand-name">UrbanLink</span>
          <span className="brand-tagline">Civic Issue Reporting Portal</span>
        </div>

        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your citizen account</p>

        {error && (
          <div className="msg error" style={{ whiteSpace: 'pre-line' }}>
            {error}
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="footer-text">
          New citizen?&nbsp;<Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;