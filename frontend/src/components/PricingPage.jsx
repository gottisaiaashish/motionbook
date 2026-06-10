import { useState, useId, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { CheckCheck, Zap } from "lucide-react";
import { VerticalCutReveal } from "./ui/VerticalCutReveal";
import { TimelineContent } from "./ui/TimelineContent";

// ─── Pricing Switch (BLACK active pill — exactly like the screenshot) ─────────
function PricingSwitch({ button1, button2, onSwitch, className = "", layoutId }) {
  const [selected, setSelected] = useState("0");
  const uniqueId = useId();
  const switchLayoutId = layoutId || `switch-${uniqueId}`;

  const handleSwitch = (value) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={`relative z-10 w-full flex rounded-full bg-neutral-50 border border-gray-200 p-1 ${className}`}>
      {[button1, button2].map((label, idx) => {
        const val = String(idx);
        const isActive = selected === val;
        return (
          <button
            key={val}
            onClick={() => handleSwitch(val)}
            className={`relative z-10 w-full sm:h-14 h-10 rounded-full sm:px-6 px-3 py-1 font-medium transition-colors ${
              isActive ? "text-white" : "text-gray-500 hover:text-black"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={switchLayoutId}
                className="absolute top-0 left-0 sm:h-14 h-10 w-full rounded-full border-4 shadow-sm shadow-black border-black bg-gradient-to-t from-neutral-900 via-neutral-800 to-neutral-900"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── 3-Button Tier Switch (BLACK active pill) ─────────────────────────────────
function TierSwitch({ options, onSwitch, layoutId }) {
  const [selected, setSelected] = useState(0);
  const uniqueId = useId();
  const switchId = layoutId || `tier-${uniqueId}`;

  const handleSwitch = (idx) => {
    setSelected(idx);
    onSwitch(idx);
  };

  return (
    <div className="relative z-10 w-full flex rounded-full bg-neutral-50 border border-gray-200 p-1">
      {options.map((label, idx) => {
        const isActive = selected === idx;
        return (
          <button
            key={idx}
            onClick={() => handleSwitch(idx)}
            className={`relative z-10 w-full h-10 sm:h-14 rounded-full px-2 py-1 font-medium text-sm transition-colors ${
              isActive ? "text-white" : "text-gray-500 hover:text-black"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={switchId}
                className="absolute inset-0 rounded-full border-4 shadow-sm shadow-black border-black bg-gradient-to-t from-neutral-900 via-neutral-800 to-neutral-900"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Price Map ────────────────────────────────────────────────────────────────
const PRICES = {
  "0-0": { price: 999,   original: 1449,  label: "Spark",        tag: "1 Album · 100 Photos · Lifetime" },
  "0-1": { price: 2499,  original: 3624,  label: "Memories",     tag: "2 Albums · 300 Photos · Lifetime" },
  "0-2": { price: 4999,  original: 7249,  label: "Forever",      tag: "1 Wedding Album · 500 Photos · Family Sharing" },
  "1-0": { price: 7999,  original: 11599, label: "Creator",      tag: "5 Client Albums · 50 GB Storage" },
  "1-1": { price: 24999, original: 36249, label: "Pro Studio",   tag: "20 Albums · 250 GB Storage · Analytics" },
  "1-2": { price: 79999, original: 115999,label: "Elite Studio", tag: "100 Albums · 1 TB Storage · White-label" },
};

const FEATURES = [
  "AR Scan — works right from the browser",
  "Lifetime access, no renewals",
  "HD photo trigger printing guide",
  "Cloudinary CDN video streaming",
  "Mobile-first Web AR scanner",
  "Family sharing (Forever & above)",
  "Priority email support",
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [isPhotographer, setIsPhotographer] = useState(false);
  const [tier, setTier] = useState(0);
  const pricingRef = useRef(null);
  const navigate = useNavigate();

  const revealVariants = {
    visible: (i) => ({
      y: 0, opacity: 1, filter: "blur(0px)",
      transition: { delay: i * 0.25, duration: 0.55, ease: "easeOut" },
    }),
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  };

  const timelineVariants = {
    visible: (i) => ({
      y: 0, opacity: 1, filter: "blur(0px)",
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  };

  const togglePlan = (val) => { setIsPhotographer(parseInt(val) === 1); setTier(0); };
  const toggleTier  = (idx) => setTier(idx);

  const key = `${isPhotographer ? 1 : 0}-${tier}`;
  const { price, original, label, tag } = PRICES[key];
  const discount = Math.round((1 - price / original) * 100);

  const handlePurchase = () => {
    navigate("/upgrade", {
      state: { selectedPlan: { name: `MotionBook ${label}`, price } },
    });
  };

  return (
    <div
      ref={pricingRef}
      className="w-full min-h-screen font-sans relative overflow-hidden"
      style={{ background: "#ffffff" }}
    >
      {/* Exact blue radial gradient from screenshot */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 90%, #fff 40%, #2529f8 100%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-36 pb-32">

        {/* ── Hero ── */}
        <div className="text-center mb-16">
          <TimelineContent
            as="div"
            animationNum={0}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="inline-flex items-center justify-center gap-2 mb-4 text-blue-600 font-medium"
          >
            <Zap className="h-5 w-5 text-blue-500 fill-blue-500" />
            Time to connect
          </TimelineContent>

          <h1 className="md:text-5xl sm:text-4xl text-3xl font-semibold text-gray-900 mb-4 leading-[120%]">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.15}
              staggerFrom="first"
              reverse={true}
              containerClassName="justify-center"
              transition={{ type: "spring", stiffness: 250, damping: 40, delay: 0.4 }}
            >
              Let's get started
            </VerticalCutReveal>
          </h1>

          <TimelineContent
            as="p"
            animationNum={1}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="text-xl text-gray-600"
          >
            Scan a photo. Relive the moment. Pay once, cherish forever.
          </TimelineContent>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid sm:grid-cols-2 md:gap-12 gap-6 items-center">

          {/* Left — Features */}
          <div>
            <TimelineContent
              as="h3"
              animationNum={2}
              timelineRef={pricingRef}
              customVariants={revealVariants}
              className="text-3xl font-medium text-gray-900 mb-4"
            >
              What's inside
            </TimelineContent>

            <div className="space-y-4">
              {FEATURES.map((feature, index) => (
                <TimelineContent
                  key={index}
                  as="div"
                  animationNum={3 + index}
                  timelineRef={pricingRef}
                  customVariants={timelineVariants}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-blue-500 shadow-md shadow-blue-500/50 rounded-full flex items-center justify-center shrink-0">
                    <CheckCheck className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </TimelineContent>
              ))}
            </div>
          </div>

          {/* Right — Toggles + Price */}
          <div className="space-y-8">

            {/* Toggle 1 — Plan type */}
            <TimelineContent
              as="div"
              animationNum={3}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <h4 className="font-semibold text-gray-900 mb-1">Who is this for?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Personal for families, Photographer for studios
              </p>
              <PricingSwitch
                button1="👤 Personal"
                button2="🎥 Photographer"
                onSwitch={togglePlan}
                layoutId="plan-switch"
                className="grid grid-cols-2 w-full"
              />
            </TimelineContent>

            {/* Toggle 2 — Tier (3 options) */}
            <TimelineContent
              as="div"
              animationNum={4}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
              <h4 className="font-semibold text-gray-900 mb-1">Plan size</h4>
              <p className="text-sm text-gray-600 mb-3">
                {isPhotographer
                  ? "Creator · Pro Studio · Elite Studio"
                  : "Spark · Memories · Forever"}
              </p>
              <TierSwitch
                key={isPhotographer ? "photo" : "personal"}
                options={isPhotographer
                  ? ["Creator", "Pro Studio", "Elite"]
                  : ["Spark", "Memories", "Forever"]}
                onSwitch={toggleTier}
                layoutId="tier-switch"
              />
            </TimelineContent>

            {/* Price + Buy */}
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={pricingRef}
              customVariants={revealVariants}
              className="grid grid-cols-2 items-center gap-2 px-2"
            >
              {/* Price block */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-5xl font-semibold text-gray-900 flex items-start">
                  <span className="text-2xl mt-1">₹</span>
                  <NumberFlow
                    value={price}
                    className="text-5xl font-semibold"
                  />
                </span>
                <span className="text-xl text-gray-500 line-through ml-1">
                  ₹<NumberFlow value={original} className="text-xl font-semibold line-through" />
                </span>
              </div>

              {/* Blue purchase button — exact match */}
              <button
                onClick={handlePurchase}
                className="text-white text-xl font-semibold h-10 sm:h-16 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-600 hover:scale-105 transition-transform"
              >
                Purchase
              </button>
            </TimelineContent>

            {/* Selected plan info pill */}
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100"
            >
              <Zap className="w-4 h-4 text-blue-500 fill-blue-500 shrink-0" />
              <div>
                <p className="text-gray-900 font-semibold text-sm">MotionBook {label}</p>
                <p className="text-gray-500 text-xs">{tag} · {discount}% off</p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}
