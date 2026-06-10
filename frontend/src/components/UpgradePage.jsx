import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPlans, createRazorpayOrder, verifyRazorpayPayment, getMySubscription } from "../api";
import { PlayCircle, ChevronLeft, CreditCard, CheckCircle, AlertCircle } from "lucide-react";

const formatPrice = (price) =>
  price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`;

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
          color: "#ea3c12",
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-[#fcf5eb] font-sans pb-24">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center gap-3 border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(20,20,20,0.9)" }}>
        <button onClick={() => step === "plans" ? navigate(-1) : setStep("plans")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ea3c12] flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black tracking-tight">Upgrade Plan</span>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-6 max-w-5xl mx-auto">
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
            <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="text-center mb-10 mt-6">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">Upgrade Package</h1>
                <p className="text-gray-400">One-time payment • Lifetime access</p>
              </div>

              {/* Tab */}
              <div className="flex justify-center mb-12">
                <div className="flex bg-[#222] p-1 rounded-full">
                  {[{ key: "user", label: "Personal" }, { key: "photographer", label: "Photographer" }].map((t) => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${activeTab === t.key ? "bg-[#fcf5eb] text-[#141414]" : "text-gray-400 hover:text-gray-200"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-4xl flex flex-col gap-6">
                {(activeTab === "user" ? userPlans : photographerPlans).map((plan) => {
                  return (
                    <div
                      key={plan._id}
                      onClick={() => handleSelectPlan(plan)}
                      className="relative group bg-[#fcf5eb] rounded-[32px] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-2xl"
                    >
                      {/* Left decorative accent */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-1/2 bg-[#ea3c12] rounded-r-xl" />

                      {/* Left Side: Title & Badge */}
                      <div className="flex-1 pl-4">
                        <h3 className="text-[#141414] text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                          {plan.name}
                        </h3>
                        {plan.badge && (
                          <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
                            {plan.badge}
                          </span>
                        )}
                        <p className="text-gray-600 text-sm max-w-sm mt-2 leading-relaxed">
                          {plan.maxAlbums >= 100 ? "Unlimited" : plan.maxAlbums} Albums • {plan.maxPhotos >= 10000 ? "Unlimited" : plan.maxPhotos} Photos • {plan.validityDays >= 3650 ? "Lifetime Access" : `${plan.validityDays} Days Access`}
                        </p>
                      </div>

                      {/* Middle: Price */}
                      <div className="flex-shrink-0 text-center sm:text-right flex items-baseline gap-1">
                        <span className="text-[#141414] text-4xl sm:text-5xl font-extrabold tracking-tight">
                          {formatPrice(plan.price)}
                        </span>
                      </div>

                      {/* Right Side: Features */}
                      <div className="flex-1 flex flex-col gap-2">
                        {plan.features?.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Confirm Purchase ── */}
          {step === "payment" && selected && !done && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="max-w-md mx-auto">
              <div className="p-8 rounded-[32px] mb-6 bg-[#fcf5eb] text-[#141414] shadow-2xl relative overflow-hidden">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-1/2 bg-[#ea3c12] rounded-r-xl" />
                <h3 className="text-2xl font-bold mb-2 tracking-tight pl-4">
                  {selected.name}
                </h3>
                <div className="text-4xl font-extrabold mb-6 pl-4">
                  {formatPrice(selected.price)}
                  <span className="text-sm text-gray-500 font-normal ml-1">one-time</span>
                </div>
                <ul className="space-y-3 mb-6 pl-4">
                  {selected.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {error && <div className="text-red-400 text-sm mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">{error}</div>}
              
              <button onClick={handlePayment} disabled={loading}
                className="w-full py-4 bg-[#ea3c12] hover:bg-[#d6330d] text-white font-bold rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CreditCard className="w-5 h-5" />Pay Securely</>}
              </button>
              <button onClick={() => setStep("plans")} className="mt-4 w-full py-2.5 text-gray-400 hover:text-white text-sm transition-colors">
                ← Back to Packages
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
              <h2 className="text-white font-bold text-3xl mb-3 tracking-tight">Payment Successful!</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">Your {selected?.name} package has been instantly activated. You can now continue using Motionbook.</p>
              <Link to="/profile"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#ea3c12] hover:bg-[#d6330d] text-white font-bold rounded-2xl transition-colors shadow-lg shadow-orange-500/25">
                Go to Profile
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
