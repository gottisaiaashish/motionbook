import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { login } from "../api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Blue gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #2529f8 100%)" }}
      />
      
      <Link to="/" className="absolute top-8 left-8 z-20 flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-xl font-bold tracking-tight text-gray-900">Motionbook</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-xl relative z-10"
      >
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Welcome back</h2>
        <p className="text-gray-500 mb-6">Sign in to your Motionbook account.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-sm text-blue-500 hover:text-blue-600">Forgot password?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-gray-500 mt-8 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-medium">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
