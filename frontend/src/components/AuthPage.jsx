import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hyperspeed from './Hyperspeed';
import { login, register, sendOTP } from '../api';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill all fields before requesting OTP.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await sendOTP(email);
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        if (!otpSent) {
          await handleSendOTP(e);
          return;
        }
        await register(name, email, password, otp);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setOtp('');
    setOtpSent(false);
  };

  return (
    <div className="relative w-screen h-screen flex justify-center items-center overflow-hidden font-sans bg-black">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed />
      </div>
      
      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>

      {/* Auth Card */}
      <div className="relative z-20 w-full max-w-[420px] bg-[#141419]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="text-center mb-8">
          <h1 className="text-white text-[32px] font-bold mb-2 tracking-tight bg-gradient-to-br from-white to-[#a5a5b0] bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-[#a5a5b0] text-[15px] m-0 font-normal">
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Sign up to get started with Motionbook'}
          </p>
        </div>

        {error && (
          <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-sm text-center mb-2">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-[#e0e0e0] text-[13px] font-medium tracking-wide uppercase">Full Name</label>
              <input
                type="text"
                id="name"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-[14px] text-white text-[15px] transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-black/50 focus:ring-4 focus:ring-white/5 placeholder:text-gray-500 box-border"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[#e0e0e0] text-[13px] font-medium tracking-wide uppercase">Email Address</label>
            <input
              type="email"
              id="email"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-[14px] text-white text-[15px] transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-black/50 focus:ring-4 focus:ring-white/5 placeholder:text-gray-500 box-border"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[#e0e0e0] text-[13px] font-medium tracking-wide uppercase">Password</label>
            <input
              type="password"
              id="password"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-[14px] text-white text-[15px] transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-black/50 focus:ring-4 focus:ring-white/5 placeholder:text-gray-500 box-border"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && otpSent && (
            <div className="flex flex-col gap-2">
              <label htmlFor="otp" className="text-[#e0e0e0] text-[13px] font-medium tracking-wide uppercase">Verification Code (OTP)</label>
              <input
                type="text"
                id="otp"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-[14px] text-white text-[15px] transition-all duration-300 focus:outline-none focus:border-white/30 focus:bg-black/50 focus:ring-4 focus:ring-white/5 placeholder:text-gray-500 box-border"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required={!isLogin && otpSent}
              />
              <p className="text-xs text-green-400 mt-1">We sent a 6-digit code to your email.</p>
            </div>
          )}

          <button 
            type={(!isLogin && !otpSent) ? "button" : "submit"}
            onClick={(!isLogin && !otpSent) ? handleSendOTP : undefined}
            className="w-full bg-white text-black rounded-xl py-4 text-[16px] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] hover:bg-[#f0f0f0] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2 shadow-[0_4px_14px_rgba(255,255,255,0.2)]"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : (otpSent ? 'Verify & Sign Up' : 'Send OTP'))}
          </button>
        </form>

        <div className="text-center mt-6 text-[#a5a5b0] text-[14px]">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            type="button" 
            onClick={toggleMode}
            className="bg-transparent border-none text-white font-semibold cursor-pointer p-0 ml-1.5 text-[14px] transition-colors duration-300 hover:text-[#a5a5b0] hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
