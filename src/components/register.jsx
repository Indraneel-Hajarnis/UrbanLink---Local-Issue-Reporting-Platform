import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';

const API = 'http://localhost:5000';

function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Quick health check
      const health = await fetch(`${API}/api/health`).catch(() => null);
      if (!health || !health.ok) {
        setError(
          'Cannot reach the server. Make sure you have run:\n  npm install\n  node server.js\n(in the project root, on port 5000)'
        );
        setLoading(false);
        return;
      }

      // 2️⃣ Registration request
      const res  = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Registration successful! Redirecting to login…');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
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
      <form className="auth-form" onSubmit={handleRegister}>
        <div className="auth-logo">
          <div className="logo-icon"></div>
          <span className="brand-name">UrbanLink</span>
          <span className="brand-tagline">Civic Issue Reporting Portal</span>
        </div>

        <h2>Create Account</h2>
        <p className="subtitle">Join thousands of active citizens</p>

        {error   && <div className="msg error"   style={{ whiteSpace: 'pre-line' }}>{error}</div>}
        {success && <div className="msg success">{success}</div>}

        <div className="input-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Rajesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="footer-text">
          Already have an account?&nbsp;<Link to="/">Sign In</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;