import { useEffect, useRef, createElement } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

/**
 * TimelineContent — scroll-triggered animation wrapper.
 * Animates when the element scrolls into view, using either
 * customVariants or a default blur+slide animation.
 */
export function TimelineContent({
  as = "div",
  children,
  className = "",
  animationNum = 0,
  customVariants,
  timelineRef, // kept for API compatibility but we use IntersectionObserver instead
  ...props
}) {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const defaultVariants = {
    hidden: { opacity: 0, y: -20, filter: "blur(10px)" },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: i * 0.12, duration: 0.5 },
    }),
  };

  const variants = customVariants || defaultVariants;

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={variants}
      custom={animationNum}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
