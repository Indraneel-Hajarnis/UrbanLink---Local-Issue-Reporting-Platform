import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';
import Navbar from './navbar';

const API = 'http://localhost:5000';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [managedWard, setManagedWard] = useState('My Ward');

  useEffect(() => {
    if (!token || userRole !== 'MANAGER') navigate('/');
    fetchWardIssues();
  }, []);

  const fetchWardIssues = async () => {
    try {
      const res = await fetch(`${API}/api/issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // The backend should already filter if we implemented the ward check in authMiddleware correctly,
        // but here we double check or assume the API returns communal issues and we filter by the manager's ward.
        // Actually, let's update server.js /api/issues to only return the allowed ward for managers.
        setIssues(data.issues);
        if (data.issues.length > 0) setManagedWard(data.issues[0].ward);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/api/issues/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        fetchWardIssues(); // refresh
        if (selectedIssue && selectedIssue.id === id) {
          setSelectedIssue(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        alert(`Error: ${data.message || 'Status update failed'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating status.');
    }
  };

  const getStatusClass = (s) => s.toLowerCase().replace(' ', '-');

  return (
    <div className="dashboard">
       <Navbar />

      <div className="dashboard-content">
        <div className="section-title">Maintenance Queue – {managedWard}</div>

        {loading ? (
          <div style={{textAlign:'center', padding:50}}>Loading ward issues...</div>
        ) : (
          <div className="recent-issues">
            <table className="issue-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Issue</th>
                  <th>Reported By</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(i => (
                  <tr key={i.id} style={{cursor:'pointer'}} onClick={() => setSelectedIssue(i)}>
                    <td><span style={{fontSize:11, fontWeight:700, color: i.confidence === 'high' ? 'var(--error)' : 'var(--text-muted)'}}>{i.confidence.toUpperCase()}</span></td>
                    <td>
                      <div style={{fontWeight:600}}>{i.title}</div>
                      <div style={{fontSize:11, color:'var(--text-muted)'}}>{i.location}</div>
                    </td>
                    <td><div style={{fontSize:12}}>{i.userEmail}</div></td>
                    <td>{i.category}</td>
                    <td><span className={`status-badge ${getStatusClass(i.status)}`}>{i.status}</span></td>
                    <td>
                      <button className="filter-btn active" style={{fontSize:11, padding:'4px 8px'}}>View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {issues.length === 0 && <div style={{textAlign:'center', padding:40}}>All clear! No issues reported in your ward.</div>}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedIssue && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div className="card" style={{width:'90%', maxWidth:700, maxHeight:'90vh', overflow:'auto', padding:0, borderRadius:20}}>
             <div style={{padding:'20px 30px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h2 style={{fontFamily:'Playfair Display'}}>Issue Details: {selectedIssue.id.slice(0,8)}</h2>
                <button onClick={() => setSelectedIssue(null)} style={{background:'none', border:'none', fontSize:28, cursor:'pointer', color: 'var(--text-dark)', opacity: 0.7}}>×</button>
             </div>
             
             <div style={{padding:30}}>
                <div style={{display:'grid', gridTemplateColumns:'250px 1fr', gap:25}}>
                   <div>
                      <img 
                        src={selectedIssue.photoUrl ? (selectedIssue.photoUrl.startsWith('http') ? selectedIssue.photoUrl : `${API}${selectedIssue.photoUrl}`) : 'https://placehold.co/400x400?text=No+Photo'} 
                        alt="Issue" 
                        style={{width:'100%', borderRadius:12, boxShadow:'0 4px 15px rgba(0,0,0,0.1)'}} 
                      />
                   </div>
                   <div>
                      <div className={`status-badge ${getStatusClass(selectedIssue.status)}`} style={{marginBottom:15}}>{selectedIssue.status}</div>
                      <h3 style={{marginBottom:10}}>{selectedIssue.title}</h3>
                      <p style={{fontSize:14, color:'var(--text-dark)', marginBottom:20}}>{selectedIssue.description || selectedIssue.aiDescription}</p>
                      
                      <div style={{display:'grid', gap:10}}>
                         <div style={{fontSize:13}}><span style={{color:'var(--text-muted)'}}>📍 Location:</span> {selectedIssue.location}</div>
                         <div style={{fontSize:13}}><span style={{color:'var(--text-muted)'}}>📂 Category:</span> {selectedIssue.category}</div>
                         <div style={{fontSize:13}}><span style={{color:'var(--text-muted)'}}>📅 Reported:</span> {selectedIssue.date}</div>
                         <div style={{fontSize:13}}><span style={{color:'var(--text-muted)'}}>👤 Citizen:</span> {selectedIssue.userName} ({selectedIssue.userEmail})</div>
                      </div>
                   </div>
                </div>

                <div style={{marginTop:30, padding:20, background:'var(--blue-light)', borderRadius:12}}>
                   <h4 style={{marginBottom:8, fontSize:13, color:'var(--blue-deep)'}}>Update Resolution Status</h4>
                    <div style={{display:'flex', gap:10}}>
                      <button 
                        className={`resolution-btn ${selectedIssue.status === 'Pending' ? 'active-pending' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(selectedIssue.id, 'Pending'); }}
                      >
                        Pending
                      </button>
                      <button 
                        className={`resolution-btn ${selectedIssue.status === 'In Progress' ? 'active-progress' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(selectedIssue.id, 'In Progress'); }}
                      >
                        In Progress
                      </button>
                      <button 
                        className={`resolution-btn ${selectedIssue.status === 'Resolved' ? 'active-resolved' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(selectedIssue.id, 'Resolved'); }}
                      >
                        Resolved
                      </button>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
