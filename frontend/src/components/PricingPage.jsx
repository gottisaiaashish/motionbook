import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPlans } from "../api";

const formatPrice = (price) =>
  price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`;

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
    <div className="min-h-screen bg-[#141414] text-[#fcf5eb] font-sans pt-12 pb-24 px-4 sm:px-6 flex flex-col items-center selection:bg-orange-500/30">
      
      {/* Header */}
      <div className="max-w-3xl w-full text-center mt-12 mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4"
          style={{ letterSpacing: "-0.03em" }}
        >
          MotionBook Packages
        </motion.h1>
      </div>

      {/* Tab Toggle */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-[#222] p-1 rounded-full">
          {[
            { key: "user", label: "Personal" },
            { key: "photographer", label: "Photographer" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[#fcf5eb] text-[#141414]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              {displayed.map((plan) => (
                <div
                  key={plan._id}
                  onClick={() => handleSelect(plan)}
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
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

    </div>
  );
}
