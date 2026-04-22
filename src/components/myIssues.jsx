import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';
import Navbar from './navbar';

const API = 'http://localhost:5000';

const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Resolved'];

const CONFIDENCE_COLOR = { high: '#138808', medium: '#e6851a', low: '#a0b4c8' };

export default function MyIssues() {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'Citizen';

  const [issues,   setIssues]   = useState([]);
  const [filter,   setFilter]   = useState('All');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => { if (!token) navigate('/'); else loadIssues(); }, [token]);

  const loadIssues = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/api/issues/mine`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setIssues(data.issues);
      else setError(data.message || 'Failed to load issues.');
    } catch {
      setError('Cannot reach server. Make sure node server.js is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (n) => n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

  const filtered = filter === 'All' ? issues : issues.filter(i => i.status === filter);

  const stats = {
    total:    issues.length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
    pending:  issues.filter(i => i.status === 'Pending').length,
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }
    catch { return iso; }
  };

  const statusClass = (s) => s.replace(' ', '-');

  return (
    <div className="dashboard">
      <Navbar />

      <div className="page-content wide">

        {/* Header */}
        <div className="page-header">
          <div className="page-header-icon">🔍</div>
          <div>
            <h2>My Reported Issues</h2>
            <p>Track the status of every issue you have submitted to UrbanLink.</p>
          </div>
        </div>

        {/* Mini stats */}
        {!loading && !error && (
          <div className="my-stats">
            <div className="my-stat-card total">
              <div className="my-stat-icon">📋</div>
              <div>
                <div className="my-stat-label">Total Reported</div>
                <div className="my-stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="my-stat-card resolved">
              <div className="my-stat-icon">✅</div>
              <div>
                <div className="my-stat-label">Resolved</div>
                <div className="my-stat-value">{stats.resolved}</div>
              </div>
            </div>
            <div className="my-stat-card pending">
              <div className="my-stat-icon">⏳</div>
              <div>
                <div className="my-stat-label">Pending</div>
                <div className="my-stat-value">{stats.pending}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        {!loading && !error && (
          <div className="filter-bar">
            {STATUS_FILTERS.map(f => (
              <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
            <span className="count-badge">{filtered.length} issue{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* States */}
        {loading && (
          <div style={{textAlign:'center', padding:'80px 0', color:'var(--text-muted)'}}>
            <div className="spinner" style={{width:32,height:32,borderWidth:3,margin:'0 auto 16px'}}></div>
            Loading your issues…
          </div>
        )}

        {error && <div className="alert error"><span className="alert-icon">⚠️</span><span>{error}</span></div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">{filter === 'All' ? '📭' : '🔍'}</div>
            <h3>{filter === 'All' ? 'No Issues Yet' : `No ${filter} Issues`}</h3>
            <p>
              {filter === 'All'
                ? "You haven't reported any civic issues yet. Help improve your city!"
                : `None of your issues are currently "${filter}".`}
            </p>
            {filter === 'All' && (
              <button className="btn-primary" onClick={() => navigate('/report-issue')}>
                📝 Report Your First Issue
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="issues-list">
            {filtered.map((issue, idx) => (
              <div
                key={issue.id}
                className={`issue-card ${statusClass(issue.status)}`}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className="issue-card-inner">
                  <div className="issue-card-stripe"></div>

                  {/* Photo */}
                  <div className="issue-card-photo">
                    {issue.photoUrl ? (
                      <img src={`${API}${issue.photoUrl}`} alt={issue.title} />
                    ) : (
                      <div className="no-photo"><span>🖼️</span>No photo</div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="issue-card-body">
                    <div className="issue-card-header">
                      <div className="issue-main">
                        <span className="issue-id">{issue.id}</span>
                        <span className="issue-category">{issue.category}</span>
                        <span className="issue-ward-badge" style={{fontSize:10, background:'var(--blue-light)', padding:'2px 6px', borderRadius:4, color:'var(--blue-mid)', fontWeight:600}}>{issue.ward || 'Unknown Ward'}</span>
                      </div>
                      <span className={`status-badge ${issue.status.toLowerCase().replace(' ', '-')}`}>
                        {issue.status}
                      </span>
                    </div>

                    <div className="issue-card-meta">
                      <span>📍 {issue.location}</span>
                      <span>📅 {issue.date}</span>
                      <span>🕐 Submitted {fmtDate(issue.submittedAt)}</span>
                    </div>

                    {issue.description && (
                      <div className="issue-card-desc">{issue.description}</div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="issue-card-footer">
                  <span className="ai-tag">
                    {issue.category}
                    {issue.confidence && (
                      <span style={{
                        marginLeft:6, fontSize:'10.5px', fontWeight:600,
                        color: CONFIDENCE_COLOR[issue.confidence] || '#aaa'
                      }}>
                        ({issue.confidence} confidence)
                      </span>
                    )}
                  </span>
                  {issue.aiDescription && (
                    <span style={{fontSize:'12px', color:'var(--text-muted)', fontStyle:'italic', maxWidth:'55%', textAlign:'right'}}>
                      "{issue.aiDescription}"
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}