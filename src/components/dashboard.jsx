import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const API = 'http://localhost:5000';

const RECENT_FALLBACK = [];

export default function Dashboard() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const [userName, setUserName] = useState('Citizen');
  const [stats,    setStats]    = useState({ 
    total: 0, 
    resolved: 0, 
    pending: 0, 
    community: 0,
    categories: { infrastructure: 0, sanitation: 0, utilities: 0 } 
  });
  const [recent,     setRecent]     = useState([]);
  const [wardFilter, setWardFilter] = useState('All');

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    const stored = localStorage.getItem('userName');
    if (stored) setUserName(stored);
    loadStats();
    loadRecent();
  }, []);

  const loadStats = async () => {
    try {
      const res  = await fetch(`${API}/api/issues/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.total !== undefined) setStats(data);
    } catch { /* use defaults */ }
  };

  const loadRecent = async () => {
    try {
      const res  = await fetch(`${API}/api/issues`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.issues)
        setRecent(data.issues.slice(0, 5).map(i => ({
          id:       i.id,
          title:    i.title,
          category: i.category || '—',
          date:     i.date,
          ward:     i.ward || 'Unknown',
          status:   i.status.toLowerCase().replace(' ', '-'),
        })));
    } catch { setRecent([]); }
  };

  const getInitials = (name) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const resolutionRate = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="dashboard">

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">🏛️</div>
          <div>
            <h1>UrbanLink</h1>
            <span className="tagline">Civic Issue Reporting Portal</span>
          </div>
        </div>

        <div className="navbar-right">
          {/* Quick nav links — visible without scrolling */}
          <button className="nav-link-btn" onClick={() => navigate('/report-issue')}>
            📝 Report Issue
          </button>
          <button className="nav-link-btn" onClick={() => navigate('/my-issues')}>
            🔍 My Issues
          </button>

          <div className="navbar-user">
            <div className="user-avatar">{getInitials(userName)}</div>
            <span>{userName}</span>
          </div>
          <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div className="dashboard-content">

        {/* Welcome Banner */}
        <div className="welcome-banner">
          <h2>Good Day, {userName.split(' ')[0]}! 🇮🇳</h2>
          <p>Your city, your voice. Report, track and resolve civic issues in your ward.</p>
          <div className="welcome-badge">
            <div className="badge-num">{resolutionRate}%</div>
            <div className="badge-label">Resolution<br/>Rate</div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="section-title">Overview</div>
        <div className="analytics">
          <div className="card reported">
            <div className="card-icon">📋</div>
            <h3>Reported Issues</h3>
            <div className="card-value">{stats.total}</div>
            <div className="card-trend up">Your reports</div>
          </div>
          <div className="card resolved">
            <div className="card-icon">✅</div>
            <h3>Resolved Issues</h3>
            <div className="card-value">{stats.resolved}</div>
            <div className="card-trend up">Fixed by authorities</div>
          </div>
          <div className="card pending">
            <div className="card-icon">⏳</div>
            <h3>Pending Issues</h3>
            <div className="card-value">{stats.pending}</div>
            <div className="card-trend down">Awaiting action</div>
          </div>
          <div className="card citizens">
            <div className="card-icon">👥</div>
            <h3>Community Reports</h3>
            <div className="card-value">{stats.community}</div>
            <div className="card-trend up">Total in system</div>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-section">
          <h3>Issue Resolution Progress <span style={{fontWeight:400,fontSize:12,color:'var(--text-muted)'}}>(Community Wide)</span></h3>
          <div className="progress-item">
            <div className="progress-header"><span>Roads &amp; Infrastructure</span><span>{stats.categories?.infrastructure || 0}%</span></div>
            <div className="progress-bar-bg"><div className="progress-bar-fill saffron" style={{ width: `${stats.categories?.infrastructure || 0}%` }}></div></div>
          </div>
          <div className="progress-item">
            <div className="progress-header"><span>Sanitation &amp; Waste</span><span>{stats.categories?.sanitation || 0}%</span></div>
            <div className="progress-bar-bg"><div className="progress-bar-fill green" style={{ width: `${stats.categories?.sanitation || 0}%` }}></div></div>
          </div>
          <div className="progress-item">
            <div className="progress-header"><span>Electricity &amp; Lighting</span><span>{stats.categories?.utilities || 0}%</span></div>
            <div className="progress-bar-bg"><div className="progress-bar-fill blue" style={{ width: `${stats.categories?.utilities || 0}%` }}></div></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-title">Quick Actions</div>
        <div className="actions">
          <button className="action-btn primary" onClick={() => navigate('/report-issue')}>
            <span className="btn-icon">📝</span>
            <span className="btn-title">Report New Issue</span>
            <span className="btn-desc">Submit a civic problem in your area</span>
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/my-issues')}>
            <span className="btn-icon">🔍</span>
            <span className="btn-title">Track My Issues</span>
            <span className="btn-desc">View status of issues you reported</span>
          </button>
          <button className="action-btn tertiary" onClick={() => navigate('/community-reports')}>
            <span className="btn-icon">🏘️</span>
            <span className="btn-title">Community Reports</span>
            <span className="btn-desc">Browse issues in your ward</span>
          </button>
          <button className="action-btn info" onClick={() => navigate('/ward-analytics')}>
            <span className="btn-icon">📊</span>
            <span className="btn-title">Ward Analytics</span>
            <span className="btn-desc">Stats and trends for your area</span>
          </button>
        </div>

        {/* Recent Issues Table */}
        <div className="recent-issues">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
            <h3>Recent Issue Reports</h3>
            <div className="filter-group" style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{fontSize:12, color:'var(--text-muted)'}}>Filter by Ward:</span>
              <select 
                value={wardFilter} 
                onChange={(e) => setWardFilter(e.target.value)}
                style={{
                  padding:'6px 12px', borderRadius:8, border:'1px solid var(--border)',
                  fontSize:13, background:'var(--white)', color:'var(--text-dark)'
                }}
              >
                <option value="All">All Wards</option>
                <optgroup label="Mumbai BMC">
                  <option value="BMC A">BMC A Ward</option>
                  <option value="BMC K/W">BMC K/W Ward</option>
                  <option value="BMC K/E">BMC K/E Ward</option>
                  <option value="BMC H/W">BMC H/W Ward</option>
                </optgroup>
                <optgroup label="Larger MMR">
                  <option value="TMC">Thane (TMC)</option>
                  <option value="NMMC">Navi Mumbai (NMMC)</option>
                  <option value="KDMC">Kalyan (KDMC)</option>
                </optgroup>
              </select>
            </div>
          </div>
          <table className="issue-table">
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Title</th>
                <th>Ward</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent
                .filter(i => wardFilter === 'All' || i.ward?.includes(wardFilter))
                .map(issue => (
                <tr key={issue.id}>
                  <td><strong>{issue.id}</strong></td>
                  <td>{issue.title}</td>
                  <td><span style={{fontSize:11, background:'var(--blue-light)', padding:'2px 6px', borderRadius:4, color:'var(--blue-mid)'}}>{issue.ward}</span></td>
                  <td>{issue.category}</td>
                  <td>{issue.date}</td>
                  <td>
                    <span className={`status-badge ${issue.status}`}>
                      {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <footer className="dashboard-footer">
        UrbanLink — Empowering Citizens, Building Better Cities &nbsp;|&nbsp; 🇮🇳 Made in India
      </footer>
    </div>
  );
}