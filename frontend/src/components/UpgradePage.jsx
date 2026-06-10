import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPlans, createRazorpayOrder, verifyRazorpayPayment, getMySubscription } from "../api";
import {
  PlayCircle, ChevronLeft, Check,
  Zap, CreditCard, CheckCircle, AlertCircle
} from "lucide-react";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function UpgradePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [activeTab, setActiveTab] = useState("user");
  const [selected, setSelected] = useState(location.state?.selectedPlan || null);
  const [step, setStep] = useState("plans"); // plans | payment
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

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

  const handlePayment = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      // Create order on backend
      const orderData = await createRazorpayOrder(selected._id);

      if (!orderData.keyId) {
         throw new Error("Razorpay keys are not configured on the server.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Motionbook",
        description: orderData.plan?.description,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            setLoading(true);
            await verifyRazorpayPayment({
              orderId: orderData.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setDone(true);
          } catch (err) {
            setError(err.message || "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#f97316", // Orange-500
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        setError(response.error.description || "Payment failed");
      });
      paymentObject.open();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Only unset loading if it failed to open, otherwise handler unsets it
    }
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
          {step === "plans" && !done && (
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
          {step === "payment" && selected && !done && (
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
                  Instant Activation via Razorpay
                </div>
              </div>
              
              {error && <div className="text-red-400 text-sm mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">{error}</div>}
              
              <button onClick={handlePayment} disabled={loading}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CreditCard className="w-5 h-5" />Pay with Razorpay</>}
              </button>
              <button onClick={() => setStep("plans")} className="mt-3 w-full py-2.5 text-gray-400 hover:text-white text-sm transition-colors">
                ← Back to Plans
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
              <h2 className="text-white font-black text-2xl mb-3">Payment Successful! 🎉</h2>
              <p className="text-gray-400 mb-8">Your {selected?.name} has been instantly activated. You can now continue using Motionbook.</p>
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
