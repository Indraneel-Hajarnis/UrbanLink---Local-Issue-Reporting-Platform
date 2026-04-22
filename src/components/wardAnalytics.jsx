import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import './dashboard.css';

const API = 'http://localhost:5000';
const COLORS = ['#138808', '#FF9933', '#0055a5', '#9b59b6'];

export default function WardAnalytics() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('single');
  const [ward1, setWard1] = useState('');
  const [ward2, setWard2] = useState('');
  const [wards, setWards] = useState([]);

  useEffect(() => {
    if (!token) navigate('/');
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API}/api/issues/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setData(json.wards);
        const wardList = Object.keys(json.wards).sort();
        setWards(wardList);
        if (wardList.length > 0) {
          setWard1(wardList[0]);
          if (wardList.length > 1) setWard2(wardList[1]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = (wardName) => {
    if (!data[wardName]) return [];
    const s = data[wardName].status;
    return [
      { name: 'Resolved', value: s.Resolved },
      { name: 'Pending', value: s.Pending },
      { name: 'In Progress', value: s['In Progress'] }
    ].filter(v => v.value > 0);
  };

  const getCategoryData = (wardName) => {
    if (!data[wardName]) return [];
    const cat = data[wardName].category;
    return Object.entries(cat)
      .map(([name, value]) => ({ name: name.split('/')[0], value }))
      .filter(v => v.value > 0)
      .sort((a,b) => b.value - a.value);
  };

  const renderWardPanel = (wardName, label) => {
    const wData = data[wardName];
    if (!wData) return null;

    const chartData = getChartData(wardName);
    const catData = getCategoryData(wardName);

    return (
      <div className="card" style={{padding:30, animation:'fadeInUp 0.5s ease'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:20}}>
          <h2 style={{fontFamily:'Playfair Display', color:'var(--blue-deep)'}}>{label}: {wardName}</h2>
          <div className="welcome-badge" style={{position:'static', transform:'none'}}>
            <div className="badge-num" style={{fontSize:24}}>{wData.resolutionRate}%</div>
            <div className="badge-label">Resolution Rate</div>
          </div>
        </div>

        <div className="analytics" style={{gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20}}>
          <div style={{height:300}}>
            <h4 style={{textAlign:'center', marginBottom:10, fontSize:14, color:'var(--text-muted)'}}>Status Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{height:300}}>
            <h4 style={{textAlign:'center', marginBottom:10, fontSize:14, color:'var(--text-muted)'}}>Issue Categories</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} fontSize={10} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--saffron)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{marginTop:25, paddingTop:20, borderTop:'1px solid var(--border)', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', textAlign:'center'}}>
           <div>
             <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase'}}>Total Issues</div>
             <div style={{fontSize:20, fontWeight:700, color:'var(--blue-mid)'}}>{wData.total}</div>
           </div>
           <div>
             <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase'}}>Active Cases</div>
             <div style={{fontSize:20, fontWeight:700, color:'var(--saffron-dark)'}}>{wData.status.Pending + wData.status['In Progress']}</div>
           </div>
           <div>
             <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase'}}>Resolved</div>
             <div style={{fontSize:20, fontWeight:700, color:'var(--green)'}}>{wData.status.Resolved}</div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/dashboard')} style={{cursor:'pointer'}}>
          <div className="brand-icon">🏛️</div>
          <div>
            <h1>UrbanLink</h1>
            <span className="tagline">Civic Analytics Dashboard</span>
          </div>
        </div>
        <div className="navbar-right">
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link-btn" onClick={() => navigate('/community-reports')}>Community</button>
          <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="section-title">Ward Intelligence & Analytics</div>
        
        {!loading && wards.length === 0 ? (
          <div className="card" style={{padding:'80px 40px', textAlign:'center'}}>
            <div style={{fontSize:60, marginBottom:20}}>📊</div>
            <h2 style={{fontFamily:'Playfair Display', marginBottom:12}}>No Civic Data Available</h2>
            <p style={{color:'var(--text-muted)', maxWidth:500, margin:'0 auto 30px'}}>
              Analytics require reported issues with valid ward classifications. 
              Once citizens begin reporting issues in Mumbai MMR, this dashboard will populate with real-time insights.
            </p>
            <button className="action-btn primary" onClick={() => navigate('/report-issue')} style={{width:'auto', padding:'12px 30px'}}>
              Report First Issue
            </button>
          </div>
        ) : (
          <>
            {/* Mode Tabs */}
            <div style={{display:'flex', gap:10, marginBottom:25, borderBottom:'1px solid var(--border)', paddingBottom:0}}>
              <button 
                onClick={() => setViewMode('single')}
                style={{
                  padding:'12px 24px', border:'none', background:'none', cursor:'pointer',
                  fontSize:14, fontWeight:600, color: viewMode === 'single' ? 'var(--blue-mid)' : 'var(--text-muted)',
                  borderBottom: viewMode === 'single' ? '3px solid var(--blue-mid)' : '3px solid transparent',
                  transition:'all 0.2s'
                }}
              >
                Single Ward Analysis
              </button>
              <button 
                onClick={() => setViewMode('compare')}
                style={{
                  padding:'12px 24px', border:'none', background:'none', cursor:'pointer',
                  fontSize:14, fontWeight:600, color: viewMode === 'compare' ? 'var(--blue-mid)' : 'var(--text-muted)',
                  borderBottom: viewMode === 'compare' ? '3px solid var(--blue-mid)' : '3px solid transparent',
                  transition:'all 0.2s'
                }}
              >
                Ward Comparison Tool
              </button>
            </div>

            {/* Selection Area */}
            <div className="analytics" style={{gridTemplateColumns: viewMode === 'compare' ? '1fr 1fr' : '1fr', gap:20, marginBottom:30}}>
              <div className="card" style={{padding:20}}>
                <label style={{fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:8}}>
                  {viewMode === 'compare' ? 'Select Primary Ward (Ward A)' : 'Select Ward to Analyze'}
                </label>
                <select 
                  value={ward1} 
                  onChange={(e) => setWard1(e.target.value)}
                  style={{width:'100%', padding:12, borderRadius:8, border:'1px solid var(--border)', background:'white', cursor:'pointer'}}
                >
                  {wards.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              
              {viewMode === 'compare' && (
                <div className="card" style={{padding:20, animation:'fadeInUp 0.3s ease'}}>
                  <label style={{fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:8}}>Select Comparison Ward (Ward B)</label>
                  <select 
                    value={ward2} 
                    onChange={(e) => setWard2(e.target.value)}
                    style={{width:'100%', padding:12, borderRadius:8, border:'1px solid var(--border)', background:'white', cursor:'pointer'}}
                  >
                    {wards.filter(w => w !== ward1).map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              )}
            </div>

            {loading ? (
              <div style={{textAlign:'center', padding:100}}>Calculating Ward Data...</div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns: viewMode === 'compare' ? '1fr 1fr' : '1fr', gap:30}}>
                {renderWardPanel(ward1, viewMode === 'compare' ? 'Ward A' : 'Ward Analysis')}
                {viewMode === 'compare' && ward2 && renderWardPanel(ward2, 'Ward B')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
