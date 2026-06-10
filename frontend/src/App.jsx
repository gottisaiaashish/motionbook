import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import ScanPage from './components/ScanPage';
import PricingPage from './components/PricingPage';
import ReferralPage from './components/ReferralPage';
import UpgradePage from './components/UpgradePage';
import AdminPanel from './components/AdminPanel';
import { isAuthenticated, isAdminAuthenticated } from './api';
import './App.css';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  if (!isAdminAuthenticated()) return <Navigate to="/admin" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/scan" element={<ScanPage />} />

        {/* Admin (separate auth) */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
