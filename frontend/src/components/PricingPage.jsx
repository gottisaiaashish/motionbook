import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPlans } from "../api";
import {
  PlayCircle, Check, Zap, ChevronLeft, Star,
  Camera, Users, BarChart3, Shield, Clock, ArrowRight
} from "lucide-react";

const formatGB = (bytes) => {
  if (bytes >= 1024 ** 4) return `${(bytes / 1024 ** 4).toFixed(0)} TB`;
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(0)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
};

const formatPrice = (price) =>
  price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`;

const BADGE_STYLES = {
  Popular: "bg-orange-500 text-white",
  "Best Value": "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  Enterprise: "bg-purple-600 text-white",
  "Referral Reward": "bg-green-600 text-white",
  "": "",
};

const PlanCard = ({ plan, featured, onSelect }) => {
  const priceDisplay = formatPrice(plan.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl p-6 flex flex-col ${
        featured
          ? "bg-gradient-to-b from-orange-500/20 to-orange-900/10 border-2 border-orange-500/60 shadow-lg shadow-orange-500/10"
          : "bg-white/5 border border-white/10 hover:border-orange-500/30"
      } transition-all duration-300`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${BADGE_STYLES[plan.badge] || "bg-orange-500 text-white"}`}>
          {plan.badge}
        </div>
      )}

      {/* Icon + Name */}
      <div className="mb-4">
        <div className="text-3xl mb-2">{plan.icon}</div>
        <h3 className="text-white font-bold text-lg leading-tight">{plan.name}</h3>
      </div>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-end gap-1">
          <span className={`text-3xl font-black ${featured ? "text-orange-400" : "text-white"}`}>
            {priceDisplay}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-400 text-sm mb-1">/one-time</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-gray-500" />
          <span className="text-gray-400 text-xs">
            {plan.validityDays === 3650
              ? "10 Year Access"
              : plan.validityDays === 7
              ? "7 Day Trial"
              : `${plan.validityDays} Days`}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {[
          { label: "Albums", value: plan.maxAlbums >= 100 ? "100+" : plan.maxAlbums },
          { label: "Photos", value: plan.maxPhotos >= 10000 ? "Unlimited" : plan.maxPhotos.toLocaleString() },
          { label: "Storage", value: formatGB(plan.maxStorageBytes) },
          { label: "Access", value: plan.validityDays >= 3650 ? "10 Years" : `${plan.validityDays}d` },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 rounded-lg px-3 py-2 text-center">
            <div className="text-white font-bold text-sm">{s.value}</div>
            <div className="text-gray-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature list */}
      <ul className="space-y-2 mb-6 flex-1">
        {plan.features?.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${featured ? "text-orange-400" : "text-green-400"}`} />
            {f}
          </li>
        ))}
        {plan.hasFamilySharing && (
          <li className="flex items-center gap-2 text-sm text-orange-300">
            <Users className="w-4 h-4 flex-shrink-0 text-orange-400" />
            Family Sharing
          </li>
        )}
        {plan.hasAnalytics && (
          <li className="flex items-center gap-2 text-sm text-orange-300">
            <BarChart3 className="w-4 h-4 flex-shrink-0 text-orange-400" />
            Analytics Dashboard
          </li>
        )}
        {plan.hasPrioritySupport && (
          <li className="flex items-center gap-2 text-sm text-orange-300">
            <Shield className="w-4 h-4 flex-shrink-0 text-orange-400" />
            Priority Support
          </li>
        )}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
          featured
            ? "bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/30"
            : plan.price === 0
            ? "bg-white/10 hover:bg-white/15 text-white border border-white/20"
            : "bg-white/10 hover:bg-orange-500/20 text-white border border-orange-500/30 hover:border-orange-500/60"
        }`}
      >
        {plan.price === 0 ? "Start Free" : "Get Started"} →
      </button>
    </motion.div>
  );
};

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState("user");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const userPlans = plans.filter((p) => p.type === "user");
  const photographerPlans = plans.filter((p) => p.type === "photographer");
  const displayed = activeTab === "user" ? userPlans : photographerPlans;

  const handleSelect = (plan) => {
    if (plan.price === 0) {
      navigate("/signup");
    } else {
      navigate("/upgrade", { state: { selectedPlan: plan } });
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0a0a", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(10,10,10,0.85)" }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">Motionbook</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-gray-400 text-sm hover:text-white transition-colors">Sign In</Link>
          <Link to="/signup" className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold text-orange-400"
            style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}
          >
            <Zap className="w-3 h-3" /> One-time payment · No subscriptions · 10 Years access
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight"
          >
            Choose Your{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              MotionBook
            </span>{" "}
            Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-xl mx-auto"
          >
            Photos that play videos. Memories that come alive. Pay once, cherish forever.
          </motion.p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { key: "user", label: "👤 Personal Plans" },
              { key: "photographer", label: "🎥 Photographer Plans" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {displayed.map((plan, i) => (
                <PlanCard
                  key={plan._id || plan.planKey}
                  plan={plan}
                  featured={plan.badge === "Popular" || plan.badge === "Best Value"}
                  onSelect={handleSelect}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Free Demo banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.15)" }}
        >
          <div>
            <div className="text-white font-bold text-lg mb-1">🎁 Try MotionBook Free — No credit card</div>
            <p className="text-gray-400 text-sm">1 photo + 1 video + AR Scan · 7 days · Completely free demo</p>
          </div>
          <Link
            to="/signup"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all border border-white/20 whitespace-nowrap"
          >
            Start Free Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Referral Reward */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 rounded-2xl p-6"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,88,12,0.04))", border: "1px solid rgba(249,115,22,0.15)" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-orange-400 font-bold text-lg mb-1">🎁 Refer 3 Friends → Get MotionBook Mini FREE</div>
              <p className="text-gray-400 text-sm">Worth ₹499 · 1 album · 10 photos · 30 days · Unlock by referring 3 verified friends</p>
            </div>
            <Link
              to="/referral"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-semibold text-sm transition-all border border-orange-500/30 whitespace-nowrap"
            >
              <Star className="w-4 h-4" /> View Referral
            </Link>
          </div>
        </motion.div>

        {/* Features row */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: Camera, title: "AR Scan", desc: "All plans include AR magic" },
            { icon: Clock, title: "10 Year Access", desc: "Your memories, guaranteed" },
            { icon: Shield, title: "Secure Storage", desc: "Cloudinary CDN backed" },
            { icon: Users, title: "Family Sharing", desc: "Available on Forever plan" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(249,115,22,0.1)" }}>
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-white font-semibold text-sm mb-1">{title}</div>
              <div className="text-gray-500 text-xs">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
