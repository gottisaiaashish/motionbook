import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { sendOTP, register } from "../api";

export default function SignupPage() {
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendOTP(email);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password, otp);
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all";

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
        {step === "form" ? (
          <>
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Create an account</h2>
            <p className="text-gray-500 mb-6">Start bringing your stories to life.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Create a strong password"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Continue"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-gray-500 mt-8 text-sm">
              Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">Log in</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Verify your email</h2>
            <p className="text-gray-500 mb-6">We sent a 6-digit code to <span className="text-gray-900 font-medium">{email}</span></p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`${inputClass} text-center text-2xl tracking-widest`}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <button 
              onClick={() => setStep("form")} 
              className="w-full text-center text-gray-500 mt-4 text-sm hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
