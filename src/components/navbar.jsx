import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../index.css';

const API = 'http://localhost:5000';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token    = localStorage.getItem('token');
  let role     = localStorage.getItem('userRole') || 'CITIZEN';
  if (role === 'USER') role = 'CITIZEN';
  const userName = localStorage.getItem('userName') || 'User';
  
  const [unassigned, setUnassigned] = useState([]);

  useEffect(() => {
    if (token && role === 'MAYOR') {
      fetchUnassigned();
    }
  }, [token, role, location.pathname]);

  const fetchUnassigned = async () => {
    try {
      const res = await fetch(`${API}/api/mayor/unassigned-wards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUnassigned(data.unassigned || []);
    } catch (err) {
      console.error('Error fetching unassigned wards:', err);
    }
  };

  const getInitials = (n) => n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const navToDashboard = () => {
    if (role === 'MAYOR') navigate('/mayor-dashboard');
    else if (role === 'MANAGER') navigate('/manager-dashboard');
    else navigate('/dashboard');
  };

  return (
    <>
      {/* PERSISTENT MAYOR BANNER */}
      {role === 'MAYOR' && unassigned.length > 0 && (
        <div style={{
          background: '#dc3545', 
          color: 'white', 
          padding: '10px 20px', 
          textAlign: 'center', 
          fontWeight: 600, 
          fontSize: '13px',
          boxShadow: '0 4px 10px rgba(220, 53, 69, 0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 1100
        }}>
          ⚠️ ATTENTION MAYOR: {unassigned.length} Wards ({unassigned.join(', ')}) have unassigned issues. Please deploy Ward Managers.
        </div>
      )}

      <nav className="navbar" style={{
        borderBottom: role === 'MAYOR' ? '4px solid var(--saffron)' : (role === 'MANAGER' ? '4px solid var(--green)' : '1px solid var(--border)'),
        position: 'sticky',
        top: role === 'MAYOR' && unassigned.length > 0 ? '34px' : 0,
        zIndex: 1000
      }}>
        <div className="navbar-brand" onClick={navToDashboard} style={{cursor:'pointer'}}>
          <div className="brand-icon">{role === 'MAYOR' ? '🏛️' : (role === 'MANAGER' ? '🛡️' : '🏙️')}</div>
          <div>
            <h1>UrbanLink {role === 'MAYOR' && 'Mayor'} {role === 'MANAGER' && 'Manager'}</h1>
            <span className="tagline">
              {role === 'MAYOR' ? 'City Governance' : (role === 'MANAGER' ? 'Ward Operations' : 'Civic Issue Portal')}
            </span>
          </div>
        </div>

        <div className="navbar-right">
          {role === 'CITIZEN' && (
            <>
              <button className={`nav-link-btn ${location.pathname === '/report-issue' ? 'active' : ''}`} onClick={() => navigate('/report-issue')}>📝 Report</button>
              <button className={`nav-link-btn ${location.pathname === '/my-issues' ? 'active' : ''}`} onClick={() => navigate('/my-issues')}>🔍 My Issues</button>
            </>
          )}

          <button className={`nav-link-btn ${location.pathname.includes('dashboard') ? 'active' : ''}`} onClick={navToDashboard}>Dashboard</button>
          
          {role !== 'CITIZEN' && (
            <>
              <button className={`nav-link-btn ${location.pathname === '/community-reports' ? 'active' : ''}`} onClick={() => navigate('/community-reports')}>City Feed</button>
              <button className={`nav-link-btn ${location.pathname === '/ward-analytics' ? 'active' : ''}`} onClick={() => navigate('/ward-analytics')}>Analytics</button>
            </>
          )}

          <div className="navbar-user">
            <div className="user-avatar">{getInitials(userName)}</div>
            <span>{userName}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
    </>
  );
}
