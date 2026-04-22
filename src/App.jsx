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

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"        element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/report-issue" element={<PrivateRoute><ReportIssue /></PrivateRoute>} />
        <Route path="/my-issues"         element={<PrivateRoute><MyIssues /></PrivateRoute>} />
        <Route path="/community-reports" element={<PrivateRoute><CommunityReports /></PrivateRoute>} />
        <Route path="/ward-analytics"    element={<PrivateRoute><WardAnalytics /></PrivateRoute>} />
        <Route path="/mayor-dashboard"   element={<PrivateRoute><MayorDashboard /></PrivateRoute>} />
        <Route path="/manager-dashboard" element={<PrivateRoute><ManagerDashboard /></PrivateRoute>} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}