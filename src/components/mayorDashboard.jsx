import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './dashboard.css';
import Navbar from './navbar';

const API = 'http://localhost:5000';
const COLORS = ['#138808', '#FF9933', '#0055a5'];

export default function MayorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [stats, setStats] = useState({ total:0, resolved:0, pending:0, progress:0 });
  const [catDistribution, setCatDistribution] = useState({});
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
      
      if (sRes.ok) {
        setStats(sData.community);
        setCatDistribution(sData.categoryDistribution || {});
      }
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

  const catPieData = Object.entries(catDistribution).map(([name, value]) => ({ 
    name: name.split(' ')[0], // Shorten labels
    value 
  })).sort((a,b) => b.value - a.value).slice(0, 6); // Top 6

  return (
    <div className="dashboard">
      <Navbar />

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
                  <input type="email" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} required placeholder="manager@ward.gov" style={{padding:12, borderRadius:8, border:'1px solid var(--border)', background:'white', color:'black'}} />
                </div>
                <div className="input-group">
                  <label>Temporary Password</label>
                  <input type="password" value={managerPass} onChange={e => setManagerPass(e.target.value)} required placeholder="Minimum 6 chars" style={{padding:12, borderRadius:8, border:'1px solid var(--border)', background:'white', color:'black'}} />
                </div>
               <div className="input-group">
                 <label>Assign to Ward</label>
                 <select value={managerWard} onChange={e => setManagerWard(e.target.value)} required style={{padding:12, borderRadius:8, border:'1px solid var(--border)', background:'white', color:'black'}}>
                   <option value="">Select a Ward</option>
                   <optgroup label="Unassigned/Reported">
                     {unassigned.map(w => <option key={w} value={w}>{w}</option>)}
                   </optgroup>
                   <optgroup label="BMC Wards">
                     {['A','B','C','D','E','F/N','F/S','G/N','G/S','H/E','H/W','K/E','K/W','L','M/E','M/W','N','P/N','P/S','R/C','R/N','R/S','S','T'].map(w => <option key={`bmc-${w}`} value={`BMC ${w}`}>BMC {w} Ward</option>)}
                   </optgroup>
                 </select>
               </div>
               <button type="submit" className="action-btn primary" style={{marginTop:10, color:'black'}}>Deploy Manager</button>
             </form>
          </div>

           {/* Stats Section with two Donut Charts */}
           <div className="card" style={{padding:30, display:'flex', flexDirection:'column', gap:30}}>
              {/* Status Distribution */}
              <div style={{textAlign:'center'}}>
                <h3 style={{marginBottom:10, fontSize:16, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em'}}>City Status Distribution</h3>
                <div style={{width:'100%', height:200}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                        <Cell fill="#138808" /> {/* Resolved - Green */}
                        <Cell fill="#dc3545" /> {/* Pending - Red */}
                        <Cell fill="#FF9933" /> {/* Progress - Orange */}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div style={{display:'flex', justifyContent:'center', gap:15, marginTop:5, fontSize:12}}>
                  <span style={{color:'#138808'}}>● Resolved</span>
                  <span style={{color:'#dc3545'}}>● Pending</span>
                  <span style={{color:'#FF9933'}}>● In Progress</span>
                </div>
              </div>

              <div style={{height:'1px', background:'var(--border)', margin:'0 10%'}}></div>

              {/* Category Distribution */}
              <div style={{textAlign:'center'}}>
                <h3 style={{marginBottom:10, fontSize:16, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em'}}>City Category Split</h3>
                <div style={{width:'100%', height:200}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={catPieData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                        {catPieData.map((e,i) => <Cell key={`cat-${i}`} fill={['#0055a5', '#FF9933', '#138808', '#9b59b6', '#e67e22', '#16a085'][i % 6]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10, marginTop:10, fontSize:10, color:'var(--text-muted)'}}>
                  {catPieData.map((e,i) => (
                    <span key={i}>● {e.name}</span>
                  ))}
                </div>
              </div>

              <div style={{marginTop:'auto', paddingTop:20, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                  <div style={{padding:15, background:'var(--blue-light)', borderRadius:12, textAlign:'center'}}>
                     <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase'}}>Total City Reports</div>
                     <div style={{fontSize:20, fontWeight:700, color:'var(--blue-deep)'}}>{stats.total}</div>
                  </div>
                  <div style={{padding:15, background:'var(--blue-light)', borderRadius:12, textAlign:'center'}}>
                     <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase'}}>Active Issues</div>
                     <div style={{fontSize:20, fontWeight:700, color:'var(--saffron-dark)'}}>{stats.pending + stats.progress}</div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
