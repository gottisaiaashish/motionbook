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
import BottomNav from './components/ui/BottomNav';
import { isAuthenticated, isAdminAuthenticated } from './api';
import './App.css';

const Layout = ({ children }) => (
  <div className="pb-[72px]"> {/* Pad for bottom nav */}
    {children}
    <BottomNav />
  </div>
);

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
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
        <Route path="/scan" element={<Layout><ScanPage /></Layout>} />

        {/* Admin (separate auth) */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Protected */}
        <Route path="/profile" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/referral" element={<ProtectedRoute><Layout><ReferralPage /></Layout></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute><Layout><UpgradePage /></Layout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
