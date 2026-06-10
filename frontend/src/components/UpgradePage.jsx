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
          color: "#4f46e5", // indigo-600
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
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
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
                      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t.key ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {(activeTab === "user" ? userPlans : photographerPlans).map((plan) => {
                  const isPopular = plan.badge === "Popular" || plan.badge === "Best Value" || plan.badge === "Enterprise";
                  return (
                    <motion.div key={plan._id} whileHover={{ y: -5 }}
                      onClick={() => handleSelectPlan(plan)}
                      className={`cursor-pointer ${isPopular ? "p-8 rounded-3xl bg-gradient-to-b from-indigo-900/50 to-black border border-indigo-500/30 relative overflow-hidden flex flex-col shadow-2xl shadow-indigo-500/10" : "p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col relative overflow-hidden"}`}>
                      
                      {plan.badge && (
                        <div className={`absolute top-0 right-0 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg ${isPopular ? "bg-indigo-500" : "bg-gray-600"}`}>
                          {plan.badge.toUpperCase()}
                        </div>
                      )}
                      
                      <h3 className={`text-2xl font-bold mb-2 flex items-center gap-2 ${isPopular ? "text-indigo-100" : ""}`}>
                        <span className="text-2xl">{plan.icon}</span> {plan.name}
                      </h3>
                      
                      <div className="text-4xl font-extrabold mb-6">
                        ₹{plan.price.toLocaleString("en-IN")}
                        <span className={`text-sm font-normal ${isPopular ? "text-indigo-300" : "text-gray-500"}`}> / one-time</span>
                      </div>
                      
                      <ul className={`space-y-4 mb-8 flex-1 ${isPopular ? "text-indigo-100/80" : "text-gray-300"}`}>
                        {plan.features?.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className={`w-4 h-4 flex-shrink-0 ${isPopular ? "text-indigo-400" : "text-gray-400"}`} />{f}
                          </li>
                        ))}
                      </ul>
                      
                      <button className={`block text-center w-full py-4 rounded-xl font-semibold transition-colors mt-auto ${isPopular ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25" : "bg-white/10 hover:bg-white/20"}`}>
                        Select Plan
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Confirm Purchase ── */}
          {step === "payment" && selected && !done && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="max-w-md mx-auto">
              <div className="p-8 rounded-3xl mb-4 bg-gradient-to-b from-indigo-900/30 to-black border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 text-indigo-100">
                  <span className="text-2xl">{selected.icon}</span> {selected.name}
                </h3>
                <div className="text-4xl font-extrabold mb-6">
                  ₹{selected.price?.toLocaleString("en-IN")}
                  <span className="text-sm text-indigo-300 font-normal"> / one-time</span>
                </div>
                <ul className="space-y-4 mb-6 text-indigo-100/80">
                  {selected.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <div className="p-3 rounded-xl text-xs text-indigo-200 flex items-center gap-2" style={{ background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.3)" }}>
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Instant Activation via Razorpay
                </div>
              </div>
              
              {error && <div className="text-red-400 text-sm mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">{error}</div>}
              
              <button onClick={handlePayment} disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25">
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                Go to Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
