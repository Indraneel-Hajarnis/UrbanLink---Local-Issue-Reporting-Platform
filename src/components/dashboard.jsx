import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const recentIssues = [
  { id: 'UL-1041', title: 'Pothole on MG Road', category: 'Roads', date: '26 Feb 2025', status: 'pending' },
  { id: 'UL-1040', title: 'Broken streetlight near Park St', category: 'Electricity', date: '25 Feb 2025', status: 'resolved' },
  { id: 'UL-1039', title: 'Garbage not collected – Sector 12', category: 'Sanitation', date: '24 Feb 2025', status: 'open' },
  { id: 'UL-1038', title: 'Waterlogging outside BBMP office', category: 'Drainage', date: '23 Feb 2025', status: 'critical' },
  { id: 'UL-1037', title: 'Damaged footpath – Residency Rd', category: 'Roads', date: '22 Feb 2025', status: 'resolved' },
];

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Citizen');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    const stored = localStorage.getItem('userName');
    if (stored) setUserName(stored);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

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
          <div className="navbar-user">
            <div className="user-avatar">{getInitials(userName)}</div>
            <span>{userName}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
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
            <div className="badge-num">75%</div>
            <div className="badge-label">Resolution<br/>Rate</div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="section-title">Overview</div>
        <div className="analytics">
          <div className="card reported">
            <div className="card-icon">📋</div>
            <h3>Reported Issues</h3>
            <div className="card-value">24</div>
            <div className="card-trend up">↑ 4 this week</div>
          </div>
          <div className="card resolved">
            <div className="card-icon">✅</div>
            <h3>Resolved Issues</h3>
            <div className="card-value">18</div>
            <div className="card-trend up">↑ 3 this week</div>
          </div>
          <div className="card pending">
            <div className="card-icon">⏳</div>
            <h3>Pending Issues</h3>
            <div className="card-value">6</div>
            <div className="card-trend down">↑ 1 this week</div>
          </div>
          <div className="card citizens">
            <div className="card-icon">👥</div>
            <h3>Active Citizens</h3>
            <div className="card-value">312</div>
            <div className="card-trend up">↑ 18 this week</div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <h3>Issue Resolution Progress</h3>
          <div className="progress-item">
            <div className="progress-header">
              <span>Roads &amp; Infrastructure</span>
              <span>68%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill saffron" style={{ width: '68%' }}></div>
            </div>
          </div>
          <div className="progress-item">
            <div className="progress-header">
              <span>Sanitation &amp; Waste</span>
              <span>82%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill green" style={{ width: '82%' }}></div>
            </div>
          </div>
          <div className="progress-item">
            <div className="progress-header">
              <span>Electricity &amp; Lighting</span>
              <span>55%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill blue" style={{ width: '55%' }}></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="section-title">Quick Actions</div>
        <div className="actions">
          <button className="action-btn primary">
            <span className="btn-icon">📝</span>
            <span className="btn-title">Report New Issue</span>
            <span className="btn-desc">Submit a civic problem in your area</span>
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">🔍</span>
            <span className="btn-title">Track My Issues</span>
            <span className="btn-desc">View status of issues you reported</span>
          </button>
          <button className="action-btn tertiary">
            <span className="btn-icon">🏘️</span>
            <span className="btn-title">Community Reports</span>
            <span className="btn-desc">Browse issues reported by citizens</span>
          </button>
          <button className="action-btn info">
            <span className="btn-icon">📊</span>
            <span className="btn-title">Ward Analytics</span>
            <span className="btn-desc">View stats and trends for your ward</span>
          </button>
        </div>

        {/* Recent Issues Table */}
        <div className="recent-issues">
          <h3>Recent Issue Reports</h3>
          <table className="issue-table">
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.map((issue) => (
                <tr key={issue.id}>
                  <td><strong>{issue.id}</strong></td>
                  <td>{issue.title}</td>
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

export default Dashboard;