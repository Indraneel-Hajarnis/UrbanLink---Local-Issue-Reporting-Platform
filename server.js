import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app    = express();
const PORT   = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'urbanlink_secret_key';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

// Create uploads directory
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE');
const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    cb(null, `issue_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    ['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype)
      ? cb(null, true) : cb(new Error('Only image files are allowed.'));
  },
});

// Logic will now use Supabase instead of these in-memory stores

// Auth middleware
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided.' });
  
  const token = header.split(' ')[1];
  try {
    // Verify session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      // Fallback to custom JWT if still migrating
      req.user = jwt.verify(token, SECRET);
      return next();
    }
    
    // Attach user info.
    let role = 'CITIZEN';
    let managedWard = null;

    // Check profiles table for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      role = profile.role;
      managedWard = profile.managed_ward;
    } else if (user.email === 'citymayor@gmail.com') {
      // Auto-init Mayor profile if it doesn't exist
      role = 'MAYOR';
      await supabase.from('profiles').insert({ id: user.id, email: user.email, role: 'MAYOR' });
    }

    req.user = { 
      email: user.email, 
      name: user.user_metadata?.name || user.email.split('@')[0],
      sub: user.id,
      role,
      managedWard
    };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token expired or invalid.' });
  }
}

// AI classification (now including Ward detection)
async function classifyImage(filePath, locationText = '') {
  try {
    const base64Data  = fs.readFileSync(filePath).toString('base64');
    const ext         = path.extname(filePath).toLowerCase().replace('.', '');
    const mediaTypeMap = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', gif:'image/gif' };
    const mediaType    = mediaTypeMap[ext] || 'image/jpeg';

    const prompt = `You are a highly accurate civic issue and location classification AI for the Mumbai Metropolitan Region (MMR).
Analyze this image and the provided location text: "${locationText}".

CRITICAL INSTRUCTIONS:
1. Pothole: Specifically look for holes, pits, or depressions in the road surface. Even if the image is slightly blurry, if it shows road damage, categorize as "Pothole".
2. Garbage/Waste Dumping: Look for piles of trash, overflowing bins, or littered areas.
3. Classify the ISSUE into EXACTLY ONE of these categories:
- Pothole, Garbage/Waste Dumping, Broken Streetlight, Waterlogging/Flooding, Damaged Footpath/Pavement, Illegal Construction, Open Drain/Sewer, Fallen Tree/Branch, Graffiti/Vandalism, Traffic Signal Fault, Water Leakage/Pipe Burst, Encroachment, Other Civic Issue.

2. Identify the administrative WARD or MUNICIPAL CORPORATION based on the location:
- BMC Wards: A, B, C, D, E, F/N, F/S, G/N, G/S, H/E, H/W, K/E, K/W, L, M/E, M/W, N, P/N, P/S, R/C, R/N, R/S, S, T.
- Other MMR: TMC (Thane), NMMC (Navi Mumbai), KDMC (Kalyan), MBMC (Mira-Bhayandar), VVMC (Vasai-Virar), PMC (Panvel), UMC (Ulhasnagar).

Respond with ONLY a JSON object:
{"category": "<category>", "confidence": "<high|medium|low>", "description": "<one sentence>", "ward": "<Ward Name or Municipal Corp>"}`;

    const result = await aiModel.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mediaType
        }
      }
    ]);

    const text = result.response.text();
    const parsed = JSON.parse(text.trim().replace(/```json|```/g, ''));
    
    // Normalize category to official list
    const officialCategories = [
      'Pothole', 'Garbage/Waste Dumping', 'Broken Streetlight', 'Waterlogging/Flooding', 
      'Damaged Footpath/Pavement', 'Illegal Construction', 'Open Drain/Sewer', 
      'Fallen Tree/Branch', 'Graffiti/Vandalism', 'Traffic Signal Fault', 
      'Water Leakage/Pipe Burst', 'Encroachment', 'Other Civic Issue'
    ];
    
    let finalCategory = parsed.category;
    const match = officialCategories.find(c => c.toLowerCase() === finalCategory.toLowerCase().trim());
    if (match) finalCategory = match;
    else finalCategory = 'Other Civic Issue';

    return { 
      category: finalCategory, 
      confidence: parsed.confidence, 
      aiDescription: parsed.description,
      ward: parsed.ward || 'Unknown'
    };
  } catch (err) {
    console.error('Gemini classification error:', err.message);
    return { 
      category: 'Other Civic Issue', 
      confidence: 'low', 
      aiDescription: 'Unable to classify automatically.',
      ward: 'Unknown'
    };
  }
}

// Format Supabase issue to Frontend format
function formatIssue(i) {
  if (!i) return null;
  return {
    id: i.id,
    title: i.title,
    description: i.description,
    location: i.location,
    date: i.issue_date,
    photoUrl: i.photo_url,
    category: i.category,
    confidence: i.confidence,
    aiDescription: i.ai_description,
    status: i.status,
    ward: i.ward,
    userEmail: i.user_email,
    userName: i.user_name,
    submittedAt: i.submitted_at
  };
}

// ── Routes ────────────────────────────────────────────────

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;
    
    // Also create a profile record
    await supabase.from('profiles').upsert({ id: data.user.id, email, name, role: 'user' });

    res.status(201).json({ message: 'User registered successfully. Please check your email if confirmation is enabled.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error during registration.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    let { data, error } = await supabase.auth.signInWithPassword({ email, password });

    // Handle initial Mayor login with Admin API to bypass email confirmation
    if (error && email === 'citymayor@gmail.com' && password === 'cityMayor@123') {
       // Create user via Admin API
       const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
         email,
         password,
         email_confirm: true,
         user_metadata: { name: 'City Mayor' }
       });

       if (!adminError) {
         const retry = await supabase.auth.signInWithPassword({ email, password });
         data = retry.data;
         error = retry.error;
       }
    }

    if (error) throw error;

    // Fetch profile for role/name
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

    let role = profile?.role || 'CITIZEN';
    if (email === 'citymayor@gmail.com') role = 'MAYOR';

    res.json({ 
      token: data.session.access_token, 
      name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
      role: role.toUpperCase()
    });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid email or password.' });
  }
});

// Submit issue
app.post('/api/issues', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    if (!title || !location || !date) return res.status(400).json({ message: 'Title, location and date are required.' });

    let category = 'Other Civic Issue', confidence = 'low', aiDescription = '';
    let ward = 'Unknown';
    let photoUrl = null;

    if (req.file) {
      // 1. AI Classification
      const result  = await classifyImage(req.file.path, location);
      category      = result.category;
      confidence    = result.confidence;
      aiDescription = result.aiDescription;
      ward          = result.ward;

      // 2. Upload to Supabase Storage
      const fileExt = path.extname(req.file.originalname);
      const fileName = `issue_${Date.now()}${fileExt}`;
      const fileBuffer = fs.readFileSync(req.file.path);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('issue-photos')
        .upload(fileName, fileBuffer, { contentType: req.file.mimetype, upsert: true });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
      } else {
        const { data: publicUrlData } = supabase.storage.from('issue-photos').getPublicUrl(fileName);
        photoUrl = publicUrlData.publicUrl;
      }

      // Cleanup local file
      fs.unlinkSync(req.file.path);
    }

    const { data: issue, error: dbError } = await supabase
      .from('issues')
      .insert([{
        title, 
        description: description || '', 
        location, 
        issue_date: date,
        photo_url: photoUrl,
        category, 
        confidence, 
        ai_description: aiDescription,
        status: 'Pending',
        ward,
        user_email: req.user.email,
        user_name: req.user.name,
        user_id: req.user.sub // Assuming Supabase auth or similar sub ID
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    res.status(201).json({ message: 'Issue reported successfully.', issue: formatIssue(issue) });
  } catch (err) {
    console.error('Issue submit error:', err);
    res.status(500).json({ 
      message: 'Server error while submitting issue.',
      error: err.message || err 
    });
  }
});

// My issues
app.get('/api/issues/mine', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('user_email', req.user.email)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json({ issues: data.map(formatIssue) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your issues.' });
  }
});

// Stats
app.get('/api/issues/stats', authMiddleware, async (req, res) => {
  try {
    const { data: allIssues, error: allErr } = await supabase.from('issues').select('status, user_email, category');
    if (allErr) throw allErr;

    const mine = allIssues.filter(i => i.user_email === req.user.email);
    
    // Categorical grouping
    const groups = {
      infrastructure: ['Pothole', 'Damaged Footpath/Pavement', 'Water Leakage/Pipe Burst', 'Encroachment', 'Illegal Construction'],
      sanitation:     ['Garbage/Waste Dumping', 'Open Drain/Sewer', 'Waterlogging/Flooding'],
      utilities:      ['Broken Streetlight', 'Traffic Signal Fault', 'Fallen Tree/Branch', 'Graffiti/Vandalism']
    };

    const getProg = (cats) => {
      const filtered = allIssues.filter(i => cats.includes(i.category));
      if (filtered.length === 0) return 0;
      const resolved = filtered.filter(i => i.status === 'Resolved').length;
      return Math.round((resolved / filtered.length) * 100);
    };

    res.json({
      total:     mine.length,
      resolved:  mine.filter(i => i.status === 'Resolved').length,
      pending:   mine.filter(i => i.status === 'Pending').length,
      progress:  mine.filter(i => i.status === 'In Progress').length,
      community: allIssues.length,
      categories: {
        infrastructure: getProg(groups.infrastructure),
        sanitation:     getProg(groups.sanitation),
        utilities:      getProg(groups.utilities)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats.' });
  }
});

// All issues (community)
app.get('/api/issues', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('issues').select('*').order('submitted_at', { ascending: false });
    if (error) throw error;
    res.json({ issues: data.map(formatIssue) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issues.' });
  }
});

// Update status
app.put('/api/issues/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending','In Progress','Resolved'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    
    const { data, error } = await supabase
      .from('issues')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Status updated.', issue: formatIssue(data) });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status.' });
  }
});

// Detailed Analytics
app.get('/api/issues/analytics', authMiddleware, async (req, res) => {
  try {
    const { data: allIssues, error } = await supabase.from('issues').select('status, category, ward');
    if (error) throw error;

    // Get unique wards
    const wards = [...new Set(allIssues.map(i => i.ward || 'Unknown'))];
    
    const wardData = {};
    wards.forEach(w => {
      const wardIssues = allIssues.filter(i => (i.ward || 'Unknown') === w);
      
      // Status breakdown
      const statusCounts = {
        'Resolved':    wardIssues.filter(i => i.status === 'Resolved').length,
        'Pending':     wardIssues.filter(i => i.status === 'Pending').length,
        'In Progress': wardIssues.filter(i => i.status === 'In Progress').length
      };

      // Category breakdown
      const categories = ['Pothole', 'Garbage/Waste Dumping', 'Broken Streetlight', 'Waterlogging/Flooding', 'Damaged Footpath/Pavement', 'Illegal Construction', 'Open Drain/Sewer', 'Fallen Tree/Branch', 'Graffiti/Vandalism', 'Traffic Signal Fault', 'Water Leakage/Pipe Burst', 'Encroachment', 'Other Civic Issue'];
      const categoryCounts = {};
      categories.forEach(c => {
        categoryCounts[c] = wardIssues.filter(i => i.category === c).length;
      });

      wardData[w] = {
        total:    wardIssues.length,
        status:   statusCounts,
        category: categoryCounts,
        resolutionRate: wardIssues.length > 0 
          ? Math.round((statusCounts.Resolved / wardIssues.length) * 100) 
          : 0
      };
    });

    res.json({ wards: wardData });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics.' });
  }
});

// MAYOR: Create Manager
app.post('/api/mayor/create-manager', authMiddleware, async (req, res) => {
  if (req.user.role !== 'MAYOR') return res.status(403).json({ message: 'Forbidden: Mayor only.' });
  
  const { email, password, ward } = req.body;
  if (!email || !password || !ward) return res.status(400).json({ message: 'Email, password and ward are required.' });

  try {
    // Use Admin API to create user - Bypasses email confirmation & rate limits
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: `Ward Manager (${ward})` }
    });

    if (authError) throw authError;

    // 2. Set profile as MANAGER
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: authData.user.id, 
        email, 
        role: 'MANAGER', 
        managed_ward: ward 
      });

    if (profileError) throw profileError;

    res.json({ message: `Manager for ${ward} created successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Error creating manager.' });
  }
});

// MAYOR: Unassigned Wards
app.get('/api/mayor/unassigned-wards', authMiddleware, async (req, res) => {
  if (req.user.role !== 'MAYOR') return res.status(403).json({ message: 'Forbidden.' });

  try {
    const { data: issues, error: issueError } = await supabase.from('issues').select('ward');
    if (issueError) throw issueError;
    
    // Try to get managers, but handle schema cache issues gracefully
    const { data: managers, error: mgrError } = await supabase
      .from('profiles')
      .select('managed_ward')
      .eq('role', 'MANAGER');
    
    if (mgrError) {
      console.warn('Schema sync warning:', mgrError.message);
      return res.json({ unassigned: [] });
    }
    
    const reportedWards = [...new Set((issues || []).map(i => i.ward).filter(Boolean))];
    const managedWards  = (managers || []).map(m => m.managed_ward);
    
    const unassigned = reportedWards.filter(w => !managedWards.includes(w));
    res.json({ unassigned });
  } catch (err) {
    console.error('Unassigned Wards error:', err.message);
    res.status(500).json({ message: 'Error checking wards.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅  UrbanLink server → http://localhost:${PORT}`);
  console.log(`    Health : http://localhost:${PORT}/api/health\n`);
});