import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login       from './components/login';
import Register    from './components/register';
import Dashboard   from './components/dashboard';
import ReportIssue from './components/reportIssue';
import MyIssues from './components/myIssues';
import CommunityReports from './components/communityReports';
import WardAnalytics from './components/wardAnalytics';
import MayorDashboard from './components/mayorDashboard';
import ManagerDashboard from './components/managerDashboard';

function PrivateRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/" replace />;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard if role is wrong
    if (role === 'MAYOR')   return <Navigate to="/mayor-dashboard" replace />;
    if (role === 'MANAGER') return <Navigate to="/manager-dashboard" replace />;
    if (role === 'CITIZEN' || !role) return <Navigate to="/dashboard" replace />;
  }
  
  // Double check to prevent loops: if we are at /dashboard but role is not CITIZEN
  if (window.location.pathname === '/dashboard' && role && role !== 'CITIZEN') {
     if (role === 'MAYOR') return <Navigate to="/mayor-dashboard" replace />;
     if (role === 'MANAGER') return <Navigate to="/manager-dashboard" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"        element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard"    element={<PrivateRoute allowedRoles={['CITIZEN']}><Dashboard /></PrivateRoute>} />
        <Route path="/report-issue" element={<PrivateRoute allowedRoles={['CITIZEN']}><ReportIssue /></PrivateRoute>} />
        <Route path="/my-issues"         element={<PrivateRoute allowedRoles={['CITIZEN']}><MyIssues /></PrivateRoute>} />
        <Route path="/community-reports" element={<PrivateRoute><CommunityReports /></PrivateRoute>} />
        <Route path="/ward-analytics"    element={<PrivateRoute><WardAnalytics /></PrivateRoute>} />
        <Route path="/mayor-dashboard"   element={<PrivateRoute allowedRoles={['MAYOR']}><MayorDashboard /></PrivateRoute>} />
        <Route path="/manager-dashboard" element={<PrivateRoute allowedRoles={['MANAGER']}><ManagerDashboard /></PrivateRoute>} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}