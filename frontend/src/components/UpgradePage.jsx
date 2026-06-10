import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPlans, requestUpgrade, submitPaymentReference, getMySubscription } from "../api";
import {
  PlayCircle, ChevronLeft, Check, Copy, X,
  Zap, Clock, CreditCard, CheckCircle, AlertCircle
} from "lucide-react";

const formatGB = (bytes) => {
  if (!bytes) return "0 GB";
  if (bytes >= 1024 ** 4) return `${(bytes / 1024 ** 4).toFixed(0)} TB`;
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(0)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
};

const PLAN_FEATURES_EXTRA = {
  photographer: ["Photographer Dashboard", "Client Albums"],
  user: [],
};

export default function UpgradePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [activeTab, setActiveTab] = useState("user");
  const [selected, setSelected] = useState(location.state?.selectedPlan || null);
  const [step, setStep] = useState("plans"); // plans | payment | confirm
  const [orderData, setOrderData] = useState(null);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    getPlans().then((all) => setPlans(all.filter((p) => p.type === "user" || p.type === "photographer")));
    getMySubscription().then((d) => setCurrentSub(d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.selectedPlan) {
      setSelected(location.state.selectedPlan);
      setStep("payment");
    }
  }, [location.state]);

  const userPlans = plans.filter((p) => p.type === "user");
  const photographerPlans = plans.filter((p) => p.type === "photographer");

  const handleSelectPlan = (plan) => {
    setSelected(plan);
    setStep("payment");
    setError("");
  };

  const handleCreateOrder = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const data = await requestUpgrade(selected._id);
      setOrderData(data);
      setStep("confirm");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUTR = async () => {
    if (!utr.trim()) { setError("Please enter your payment reference / UTR number"); return; }
    setLoading(true);
    setError("");
    try {
      await submitPaymentReference(orderData.orderId, utr);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center gap-3 border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(10,10,10,0.9)" }}>
        <button onClick={() => step === "plans" ? navigate(-1) : setStep("plans")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black">Upgrade Plan</span>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        {/* Expired Banner */}
        {currentSub?.subscription?.isExpired && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <div className="text-red-400 font-semibold">Your {currentSub.plan?.name} has expired</div>
              <div className="text-gray-400 text-sm">Upgrade to continue uploading memories</div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ── Step 1: Plan Selection ── */}
          {step === "plans" && (
            <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Choose Your Plan</h1>
                <p className="text-gray-400">One-time payment · 10 years access</p>
              </div>

              {/* Tab */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {[{ key: "user", label: "👤 Personal" }, { key: "photographer", label: "🎥 Photographer" }].map((t) => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t.key ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeTab === "user" ? userPlans : photographerPlans).map((plan) => (
                  <motion.div key={plan._id} whileHover={{ y: -3 }}
                    onClick={() => handleSelectPlan(plan)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all ${plan.badge === "Popular" || plan.badge === "Best Value" ? "border-orange-500/50 bg-orange-500/5" : "border-white/10 bg-white/3 hover:border-orange-500/30"}`}>
                    <div className="text-2xl mb-2">{plan.icon}</div>
                    <div className="text-white font-bold mb-1">{plan.name}</div>
                    <div className="text-orange-400 text-2xl font-black mb-3">₹{plan.price.toLocaleString("en-IN")}</div>
                    <ul className="space-y-1.5">
                      {plan.features?.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <Check className="w-3 h-3 text-orange-400 flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    <button className="mt-4 w-full py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm font-semibold border border-orange-500/30 transition-all">
                      Select Plan
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Confirm Purchase ── */}
          {step === "payment" && selected && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="max-w-md mx-auto">
              <div className="p-6 rounded-2xl mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-2xl mb-2">{selected.icon}</div>
                <div className="text-white font-bold text-xl mb-1">{selected.name}</div>
                <div className="text-orange-400 text-3xl font-black mb-4">₹{selected.price?.toLocaleString("en-IN")}</div>
                <ul className="space-y-2 mb-6">
                  {selected.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <div className="p-3 rounded-xl text-xs text-gray-400 flex items-center gap-2" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
                  <Zap className="w-4 h-4 text-orange-400" />
                  Activation within 24 hours after payment verification
                </div>
              </div>
              {error && <div className="text-red-400 text-sm mb-3 p-3 rounded-xl bg-red-500/10">{error}</div>}
              <button onClick={handleCreateOrder} disabled={loading}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CreditCard className="w-5 h-5" />Proceed to Payment</>}
              </button>
              <button onClick={() => setStep("plans")} className="mt-3 w-full py-2.5 text-gray-400 hover:text-white text-sm transition-colors">
                ← Back to Plans
              </button>
            </motion.div>
          )}

          {/* ── Step 3: Payment Instructions ── */}
          {step === "confirm" && orderData && !done && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-7 h-7 text-orange-400" />
                </div>
                <h2 className="text-white font-bold text-xl">Transfer ₹{orderData.plan?.price?.toLocaleString("en-IN")}</h2>
                <p className="text-gray-400 text-sm mt-1">to complete your {orderData.plan?.name} purchase</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: "UPI ID", value: orderData.paymentInstructions?.upiId, key: "upi" },
                  { label: "Bank Account", value: orderData.paymentInstructions?.bankAccount, key: "acc" },
                  { label: "IFSC Code", value: orderData.paymentInstructions?.bankIFSC, key: "ifsc" },
                  { label: "Amount", value: `₹${orderData.paymentInstructions?.amount?.toLocaleString("en-IN")}`, key: "amt" },
                  { label: "Note / Description", value: orderData.paymentInstructions?.note, key: "note" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div>
                      <div className="text-gray-500 text-xs">{item.label}</div>
                      <div className="text-white font-mono text-sm mt-0.5">{item.value}</div>
                    </div>
                    <button onClick={() => copyText(item.value, item.key)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                      {copied === item.key ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-gray-400 text-xs font-medium mb-2 block">Enter UTR / Transaction Reference *</label>
                <input value={utr} onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. 123456789012 or UPI Ref ID"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none focus:border-orange-500/60 transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              {error && <div className="text-red-400 text-sm mb-3 p-3 rounded-xl bg-red-500/10">{error}</div>}
              <button onClick={handleSubmitUTR} disabled={loading}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Submit Payment Reference"}
              </button>
            </motion.div>
          )}

          {/* ── Done ── */}
          {done && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-sm mx-auto text-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-white font-black text-2xl mb-3">Payment Submitted! 🎉</h2>
              <p className="text-gray-400 mb-8">Your {selected?.name} will be activated within <strong className="text-white">24 hours</strong> after our team verifies your payment.</p>
              <Link to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors">
                Go to Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
