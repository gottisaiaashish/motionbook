import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getPlans, createRazorpayOrder, verifyRazorpayPayment, getMySubscription } from "../api";
import { ArrowLeft, Check, Zap, AlertCircle, Loader2 } from "lucide-react";

export default function UpgradePage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([getPlans(), getMySubscription()]);
      setPlans(plansRes.data || []);
      setSubscription(subRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planId) => {
    setProcessing(true);
    setError("");
    try {
      const res = await loadRazorpay();
      if (!res) { setError("Razorpay SDK failed to load."); setProcessing(false); return; }
      const orderRes = await createRazorpayOrder(planId);
      const { order, key } = orderRes.data;
      const options = {
        key, amount: order.amount, currency: order.currency,
        name: "MotionBook", description: "Upgrade to Premium Plan",
        order_id: order.id,
        handler: async function (response) {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            window.location.href = "/profile?upgrade=success";
          } catch (err) { setError("Payment verification failed."); }
        },
        prefill: { name: "User", email: "user@example.com" },
        theme: { color: "#2563eb" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) { setError(response.error.description); });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally { setProcessing(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const isPremium = subscription?.planType === "premium";

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-32 px-4 sm:px-6 font-sans relative overflow-hidden">
      
      {/* Blue gradient bg */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #2529f8 100%)" }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        
        <Link to="/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {isPremium ? (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-10 text-center max-w-xl mx-auto relative overflow-hidden shadow-sm">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
             <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200">
               <Zap className="w-10 h-10 text-blue-500" />
             </div>
             <h2 className="text-3xl font-bold mb-4 text-gray-900">You are Premium</h2>
             <p className="text-gray-500 mb-8 leading-relaxed">
               You currently have the Professional Plan active. Enjoy unlimited access to all features, priority support, and 4K quality.
             </p>
             <Link to="/profile" className="inline-block px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-full transition-colors">
               Go to Dashboard
             </Link>
          </div>
        ) : (
          <div>
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">Upgrade your experience</h1>
              <p className="text-xl text-gray-500 font-light">Unlock the full power of MotionBook for your business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, i) => (
                <motion.div 
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-3xl p-10 flex flex-col overflow-hidden ${
                    plan.name === 'Premium' 
                      ? 'bg-white border-2 border-black shadow-lg' 
                      : 'bg-white border border-gray-200 shadow-sm'
                  }`}
                >
                  {plan.name === 'Premium' && (
                    <>
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gray-700 to-black" />
                      <div className="absolute top-8 right-8 bg-gray-100 border border-gray-300 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Recommended
                      </div>
                    </>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                    <p className="text-gray-500 text-sm h-10">
                      {plan.name === 'Free' ? 'Start exploring for free.' : 'For photographers scaling their business.'}
                    </p>
                  </div>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold tracking-tight text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-400 font-medium ml-2">/month</span>
                  </div>

                  {plan.name === 'Premium' ? (
                    <button 
                      onClick={() => handleUpgrade(plan._id)}
                      disabled={processing}
                      className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-10 shadow-md"
                    >
                      {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : "Upgrade Now"}
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-full mb-10 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  )}

                  <div className="flex flex-col gap-4 flex-1">
                    <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${plan.name === 'Premium' ? 'text-black' : 'text-gray-400'}`}>
                      {plan.name === 'Premium' ? "Everything in Free, plus" : "What's included"}
                    </p>
                    
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 shrink-0 ${plan.name === 'Premium' ? 'text-black' : 'text-gray-400'}`} />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
