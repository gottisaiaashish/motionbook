import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import { isAuthenticated, logout } from './api';
import './App.css';

// A simple protected route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// A simple home page for logged in users
const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0f0f13] text-white font-sans">
      <h1 className="text-4xl font-bold mb-4">Welcome to Motionbook!</h1>
      <p className="text-[#a5a5b0] mb-8">You are successfully logged in.</p>
      <button 
        onClick={() => { logout(); window.location.reload(); }}
        className="px-6 py-3 rounded-xl bg-white text-black font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Log Out
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
