import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './dashboard.css';

const API = 'http://localhost:5000';
const COLORS = ['#138808', '#FF9933', '#0055a5'];

export default function MayorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [stats, setStats] = useState({ total:0, resolved:0, pending:0, progress:0 });
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Manager Creation Form
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPass,  setManagerPass]  = useState('');
  const [managerWard,  setManagerWard]  = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!token) navigate('/');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sRes = await fetch(`${API}/api/issues/stats`, { headers: { Authorization: `Bearer ${token}` }});
      const uRes = await fetch(`${API}/api/mayor/unassigned-wards`, { headers: { Authorization: `Bearer ${token}` }});
      
      const sData = await sRes.json();
      const uData = await uRes.json();
      
      if (sRes.ok) setStats(sData);
      if (uRes.ok) setUnassigned(uData.unassigned);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setMsg({ text: 'Creating...', type: 'info' });
    try {
      const res = await fetch(`${API}/api/mayor/create-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: managerEmail, password: managerPass, ward: managerWard })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: data.message, type: 'success' });
        setManagerEmail(''); setManagerPass(''); setManagerWard('');
        fetchData(); // Refresh unassigned list
      } else {
        setMsg({ text: data.message, type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Server error.', type: 'error' });
    }
  };

  const pieData = [
    { name: 'Resolved', value: stats.resolved },
    { name: 'Pending', value: stats.pending },
    { name: 'In Progress', value: stats.progress }
  ].filter(v => v.value > 0);

  return (
    <div className="dashboard">
      <nav className="navbar" style={{borderBottom:'4px solid var(--saffron)'}}>
        <div className="navbar-brand">
          <div className="brand-icon">🏛️</div>
          <div>
            <h1>UrbanLink Mayor</h1>
            <span className="tagline">City-Wide Governance Dashboard</span>
          </div>
        </div>
        <div className="navbar-right">
          <button className="nav-link-btn" onClick={() => navigate('/community-reports')}>City Feed</button>
          <button className="nav-link-btn" onClick={() => navigate('/ward-analytics')}>Analytics</button>
          <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      {unassigned.length > 0 && (
        <div style={{background:'var(--error)', color:'white', padding:'12px 20px', textAlign:'center', fontWeight:600, fontSize:14}}>
          ⚠️ ATTENTION: {unassigned.length} Wards ( {unassigned.join(', ')} ) have reported issues but no assigned Ward Manager.
        </div>
      )}

      <div className="dashboard-content">
        <div className="welcome-banner" style={{background:'linear-gradient(135deg, var(--blue-deep) 0%, #003366 100%)'}}>
          <div className="welcome-text">
            <h2>Jai Hind, Honorable Mayor</h2>
            <p>You are overseeing {stats.community} total reports across the Mumbai MMR.</p>
          </div>
          <div className="welcome-badge">
            <div className="badge-num">{Math.round((stats.resolved/stats.community)*100 || 0)}%</div>
            <div className="badge-label">City Resolution Rate</div>
          </div>
        </div>

        <div className="analytics" style={{gridTemplateColumns:'1fr 400px', gap:30}}>
          {/* Manager Assignment */}
          <div className="card" style={{padding:30}}>
             <h3 style={{marginBottom:20, color:'var(--blue-deep)'}}>Assign Ward Manager</h3>
             {msg.text && (
               <div className={`alert ${msg.type}`} style={{marginBottom:20}}>{msg.text}</div>
             )}
             <form onSubmit={handleCreateManager} style={{display:'grid', gap:15}}>
               <div className="input-group">
                 <label>Manager Email</label>
                 <input type="email" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} required placeholder="manager@ward.gov" style={{padding:12, borderRadius:8, border:'1px solid var(--border)'}} />
               </div>
               <div className="input-group">
                 <label>Temporary Password</label>
                 <input type="password" value={managerPass} onChange={e => setManagerPass(e.target.value)} required placeholder="Minimum 6 chars" style={{padding:12, borderRadius:8, border:'1px solid var(--border)'}} />
               </div>
               <div className="input-group">
                 <label>Assign to Ward</label>
                 <select value={managerWard} onChange={e => setManagerWard(e.target.value)} required style={{padding:12, borderRadius:8, border:'1px solid var(--border)', background:'white'}}>
                   <option value="">Select a Ward</option>
                   <optgroup label="Unassigned/Reported">
                     {unassigned.map(w => <option key={w} value={w}>{w}</option>)}
                   </optgroup>
                   <optgroup label="BMC Wards">
                     {['A','B','C','D','E','F/N','F/S','G/N','G/S','H/E','H/W','K/E','K/W','L','M/E','M/W','N','P/N','P/S','R/C','R/N','R/S','S','T'].map(w => <option key={`bmc-${w}`} value={`BMC ${w}`}>BMC {w} Ward</option>)}
                   </optgroup>
                 </select>
               </div>
               <button type="submit" className="action-btn primary" style={{marginTop:10}}>Deploy Manager</button>
             </form>
          </div>

          {/* Quick Stats Pie */}
          <div className="card" style={{padding:30, display:'flex', flexDirection:'column', alignItems:'center'}}>
            <h3 style={{marginBottom:20}}>City Status Distribution</h3>
            <div style={{width:'100%', height:250}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((e,i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{marginTop:20, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div style={{padding:15, background:'var(--white)', borderRadius:12, border:'1px solid var(--border)', textAlign:'center'}}>
                   <div style={{fontSize:12, color:'var(--text-muted)'}}>Total Reports</div>
                   <div style={{fontSize:18, fontWeight:700}}>{stats.community}</div>
                </div>
                <div style={{padding:15, background:'var(--white)', borderRadius:12, border:'1px solid var(--border)', textAlign:'center'}}>
                   <div style={{fontSize:12, color:'var(--text-muted)'}}>Active Issues</div>
                   <div style={{fontSize:18, fontWeight:700, color:'var(--saffron-dark)'}}>{stats.pending + stats.progress}</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
