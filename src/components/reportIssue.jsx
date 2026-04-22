import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "./index.css";

const API = 'http://localhost:5000';

const CATEGORIES = [
  'Pothole','Garbage/Waste Dumping','Broken Streetlight','Waterlogging/Flooding',
  'Damaged Footpath/Pavement','Illegal Construction','Open Drain/Sewer',
  'Fallen Tree/Branch','Graffiti/Vandalism','Traffic Signal Fault',
  'Water Leakage/Pipe Burst','Encroachment','Other Civic Issue',
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'Citizen';
  const fileRef  = useRef(null);

  const [form, setForm] = useState({
    title:'', description:'', location:'',
    date: new Date().toISOString().slice(0,10),
  });
  const [photo,      setPhoto]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [category,   setCategory]   = useState('');
  const [aiResult,   setAiResult]   = useState(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');

  useEffect(() => { if (!token) navigate('/'); }, [token, navigate]);

  const getInitials = (n) => n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP).'); return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setAiResult(null); setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const removePhoto = () => {
    setPhoto(null); setPreview(null); setAiResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleChange = (e) => setForm(p => ({...p, [e.target.name]: e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title || !form.location || !form.date) {
      setError('Please fill in all required fields.'); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('location',    form.location);
      fd.append('date',        form.date);
      if (photo) fd.append('photo', photo);

      const res  = await fetch(`${API}/api/issues`, {
        method:'POST', headers:{ Authorization:`Bearer ${token}` }, body: fd,
      });
      const data = await res.json();

      if (res.ok) {
        const issue = data.issue;
        setAiResult({ category: issue.category, description: issue.aiDescription, confidence: issue.confidence });
        setSuccess(`✅ Issue ${issue.id} submitted! AI classified it as: ${issue.category}`);
        setTimeout(() => {
          setForm({ title:'', description:'', location:'', date: new Date().toISOString().slice(0,10) });
          setPhoto(null); setPreview(null); setAiResult(null); setCategory(''); setSuccess('');
        }, 5000);
      } else {
        setError(`${data.message}${data.error ? `: ${data.error}` : ''}`);
      }
    } catch {
      setError('Cannot reach server. Make sure node server.js is running on port 5000.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">🏛️</div>
          <div><h1>UrbanLink</h1><span className="tagline">Civic Issue Reporting Portal</span></div>
        </div>
        <div className="navbar-right">
          <div className="navbar-user">
            <div className="user-avatar">{getInitials(userName)}</div>
            <span>{userName}</span>
          </div>
          <button className="nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-btn" onClick={() => navigate('/my-issues')}>My Issues</button>
          <button className="nav-btn logout" onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div className="page-header-icon">📝</div>
          <div>
            <h2>Report a Civic Issue</h2>
            <p>Your report reaches the municipal authorities directly. Upload a photo for AI classification.</p>
          </div>
        </div>

        {success && <div className="alert success"><span className="alert-icon">✅</span><span>{success}</span></div>}
        {error   && <div className="alert error"><span className="alert-icon">⚠️</span><span>{error}</span></div>}

        <form onSubmit={handleSubmit}>
          <div className="form-card">

            {/* Issue Details */}
            <div className="form-section">
              <div className="form-section-title">Issue Details</div>
              <div className="form-row single" style={{marginBottom:16}}>
                <div className="form-group">
                  <label htmlFor="title">Issue Title *</label>
                  <input id="title" name="title" type="text"
                    placeholder="e.g. Large pothole on main road causing accidents"
                    value={form.title} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea id="description" name="description"
                    placeholder="Describe the issue — size, severity, how long it has existed, who is affected…"
                    value={form.description} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Location & Date */}
            <div className="form-section">
              <div className="form-section-title">Location &amp; Date</div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location / Address *</label>
                  <input id="location" name="location" type="text"
                    placeholder="e.g. MG Road, near Barista Café, Bengaluru"
                    value={form.location} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date of Issue *</label>
                  <input id="date" name="date" type="date"
                    value={form.date} onChange={handleChange} required
                    max={new Date().toISOString().slice(0,10)} />
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="form-section">
              <div className="form-section-title">Photo Evidence &amp; AI Classification</div>
              {!preview ? (
                <div
                  className={`upload-zone${dragOver ? ' drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input type="file" accept="image/*" ref={fileRef} onChange={e => { if(e.target.files[0]) handleFile(e.target.files[0]); }} />
                  <div className="upload-icon">📸</div>
                  <h4>Drop your photo here, or click to browse</h4>
                  <p>Our AI will automatically classify the issue from your image</p>
                  <p className="file-types">JPG · PNG · WEBP &nbsp;·&nbsp; Max 10 MB</p>
                </div>
              ) : (
                <div>
                  <div className="photo-preview-wrap">
                    <img src={preview} alt="Issue preview" />
                    <button type="button" className="remove-photo" onClick={removePhoto}>✕</button>
                  </div>
                  {aiResult ? (
                    <div className="ai-badge">
                      <span className="ai-icon">🤖</span>
                      {aiResult.category}
                      {aiResult.description && (
                        <span style={{fontWeight:400, color:'#888', marginLeft:6, fontSize:'11.5px'}}>
                          — {aiResult.description}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="alert info" style={{marginTop:10}}>
                      <span className="alert-icon">🤖</span>
                      <span>AI will classify this image automatically when you submit the form.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Category Override */}
            <div className="form-section">
              <div className="form-section-title">Category Override <span style={{fontWeight:400,textTransform:'none',fontSize:11,color:'var(--text-muted)',letterSpacing:0}}>(Optional — AI auto-detects from photo)</span></div>
              <div className="category-pills">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button"
                    className={`category-pill${category === cat ? ' selected' : ''}`}
                    onClick={() => setCategory(p => p === cat ? '' : cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting
                  ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}></div>&nbsp;Submitting…</>
                  : <>📤&nbsp;Submit Report</>
                }
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}