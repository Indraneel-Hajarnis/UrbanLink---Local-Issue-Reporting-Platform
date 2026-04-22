import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css'; // Reuse dashboard styles
import Navbar from './navbar';

const API = 'http://localhost:5000';

export default function CommunityReports() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const [issues,    setIssues]    = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [wardFilter, setWardFilter] = useState('All');

  useEffect(() => {
    if (!token) navigate('/');
    loadIssues();
  }, []);

  useEffect(() => {
    let result = issues;
    if (wardFilter !== 'All') {
      result = result.filter(i => i.ward === wardFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(term) || 
        i.description.toLowerCase().includes(term)
      );
    }
    setFiltered(result);
  }, [searchTerm, wardFilter, issues]);

  const loadIssues = async () => {
    try {
      const res = await fetch(`${API}/api/issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setIssues(data.issues);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (s) => s.toLowerCase().replace(' ', '-');

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-content">
        <div className="section-title">Community Issue Reports</div>
        
        <div className="analytics" style={{gridTemplateColumns:'1fr 300px', alignItems:'center', gap:20, marginBottom:30}}>
          <div className="card" style={{padding:20}}>
            <input 
              type="text" 
              placeholder="Search by title or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px', borderRadius:10, 
                border:'1px solid var(--border)', fontSize:14, outline:'none',
                background: 'white', color: 'var(--text-dark)'
              }}
            />
          </div>
          <div className="card" style={{padding:20}}>
            <select 
              value={wardFilter} 
              onChange={(e) => setWardFilter(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px', borderRadius:10, 
                border:'1px solid var(--border)', fontSize:14, outline:'none', 
                background:'white', color: 'var(--text-dark)'
              }}
            >
              <option value="All">All Wards</option>
              {/* Unique Wards from data */}
              {[...new Set(issues.map(i => i.ward))].filter(Boolean).sort().map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:50}}>Loading community issues...</div>
        ) : (
          <div className="recent-issues">
            <h3>{filtered.length} Reports Found</h3>
            <table className="issue-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Issue Details</th>
                  <th>Ward</th>
                  <th>Category</th>
                  <th>Reported</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id}>
                    <td><small>{i.id.slice(0,8)}</small></td>
                    <td>
                      <div style={{fontWeight:600, color:'var(--blue-deep)'}}>{i.title}</div>
                      <div style={{fontSize:11, color:'var(--text-muted)'}}>{i.location}</div>
                    </td>
                    <td><span className="status-badge" style={{background:'var(--blue-light)', color:'var(--blue-mid)'}}>{i.ward}</span></td>
                    <td>{i.category}</td>
                    <td>{i.date}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(i.status)}`}>{i.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{textAlign:'center', padding:40, color:'var(--text-muted)'}}>No issues match your filters.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
