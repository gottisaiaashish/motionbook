import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyReferral, claimReferralReward } from "../api";
import {
  PlayCircle, ChevronLeft, Copy, CheckCircle, Users,
  Gift, Star, Clock, ArrowRight, Check, X, Share2
} from "lucide-react";

const StatusDot = ({ status }) => (
  <span className={`w-2 h-2 rounded-full inline-block ${status === "completed" ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
);

export default function ReferralPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [claimMsg, setClaimMsg] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getMyReferral()
      .then(setData)
      .catch(() => setError("Failed to load referral data"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const share = async () => {
    const msg = `🎬 Try MotionBook — Photos that play videos!\n\nUse my referral link to get started:\n${data?.referralLink}`;
    if (navigator.share) {
      await navigator.share({ title: "MotionBook Invitation", text: msg, url: data?.referralLink });
    } else {
      copy(data?.referralLink);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    setError("");
    setClaimMsg("");
    try {
      const res = await claimReferralReward();
      setClaimMsg(res.message);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { referralCode, referralLink, referrals = [], stats = {}, reward = {} } = data || {};
  const progressPercent = Math.min(100, ((stats.completed || 0) / 3) * 100);

  return (
    <div className="min-h-screen pb-16" style={{ background: "#0a0a0a", fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-4 flex items-center gap-3 border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(10,10,10,0.9)" }}>
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black">Referral Program</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 pt-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8">
          <div className="text-5xl mb-3">🎁</div>
          <h1 className="text-3xl font-black text-white mb-2">Refer &amp; Earn</h1>
          <p className="text-gray-400">
            Invite 3 friends to MotionBook and unlock{" "}
            <span className="text-orange-400 font-semibold">MotionBook Mini</span>{" "}
            worth ₹499 — FREE!
          </p>
        </motion.div>

        {/* Referral Code Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-5"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.05))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <div className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">Your Referral Code</div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 px-4 py-3 rounded-xl font-mono text-xl font-black text-orange-400 text-center tracking-widest"
              style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
              {referralCode || "------"}
            </div>
            <button onClick={() => copy(referralCode)}
              className="p-3 rounded-xl text-gray-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => copy(referralLink)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-colors border border-white/10 hover:border-white/20">
              📋 Copy Link
            </button>
            <button onClick={share}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white transition-colors flex items-center justify-center gap-1.5">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-5 mb-5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white font-bold">Progress</div>
              <div className="text-gray-400 text-sm">{stats.completed || 0} / 3 friends joined</div>
            </div>
            <div className="text-right">
              <div className="text-orange-400 font-black text-2xl">{stats.completed || 0}<span className="text-gray-600 text-lg">/3</span></div>
              <div className="text-gray-500 text-xs">completed</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #f97316, #ea580c)" }} />
          </div>

          {/* Steps */}
          <div className="flex justify-between">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${(stats.completed || 0) >= n ? "bg-orange-500 text-white" : "bg-white/10 text-gray-500"}`}>
                  {(stats.completed || 0) >= n ? <Check className="w-4 h-4" /> : n}
                </div>
                <div className="text-gray-600 text-xs">Friend {n}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reward Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`rounded-2xl p-5 mb-5 ${reward.eligible ? "border border-orange-500/40" : "border border-white/8"}`}
          style={{ background: reward.eligible ? "rgba(249,115,22,0.06)" : "rgba(255,255,255,0.02)" }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-white font-bold">🎁 MotionBook Mini</div>
              <div className="text-gray-400 text-sm">Your referral reward</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 line-through text-sm">₹499</div>
              <div className="text-orange-400 font-bold">FREE</div>
            </div>
          </div>
          <ul className="space-y-1.5 mb-4">
            {["1 Album", "10 Photos + Videos", "50 MB per video", "30 Days Access", "MotionBook Watermark"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                <Star className="w-3 h-3 text-orange-400" />{f}
              </li>
            ))}
          </ul>

          {claimMsg && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-3">{claimMsg}</div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-3">{error}</div>
          )}

          {reward.claimed ? (
            <div className="py-2.5 text-center text-green-400 font-semibold text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Reward Claimed!
            </div>
          ) : (
            <button onClick={handleClaim} disabled={!reward.eligible || claiming}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${reward.eligible ? "bg-orange-500 hover:bg-orange-400 text-white" : "bg-white/5 text-gray-600 cursor-not-allowed"}`}>
              {claiming
                ? "Claiming..."
                : reward.eligible
                ? "🎉 Claim MotionBook Mini"
                : `Invite ${stats.remaining || 3 - (stats.completed || 0)} more friend${(stats.remaining || 3) > 1 ? "s" : ""} to unlock`}
            </button>
          )}
        </motion.div>

        {/* Referral List */}
        {referrals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-5 py-4 border-b border-white/6">
              <div className="text-white font-bold">Invited Friends</div>
            </div>
            <ul>
              {referrals.map((r) => (
                <li key={r._id} className="flex items-center gap-3 px-5 py-3.5 border-b border-white/4 last:border-b-0">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-400">
                    {r.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{r.name}</div>
                    <div className="text-gray-500 text-xs truncate">{r.email}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={r.status} />
                    <span className={`text-xs font-medium capitalize ${r.status === "completed" ? "text-green-400" : "text-yellow-400"}`}>
                      {r.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {referrals.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            <div className="font-medium text-gray-500">No referrals yet</div>
            <div className="text-sm mt-1">Share your code above to get started!</div>
          </div>
        )}
      </div>
    </div>
  );
}
