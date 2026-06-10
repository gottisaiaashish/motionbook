import { useMemo, useRef, useState, useEffect } from "react";

function useDimensions(ref) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return dimensions;
}

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function AnimatedGradient({
  colors,
  speed = 5,
  blur = "light",
}) {
  const containerRef = useRef(null);
  const dimensions = useDimensions(containerRef);

  const circleSize = useMemo(
    () => Math.max(dimensions.width || 1000, dimensions.height || 1000),
    [dimensions.width, dimensions.height]
  );

  const blurClass =
    blur === "light"
      ? "blur-2xl"
      : blur === "medium"
      ? "blur-3xl"
      : "blur-[100px]";

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 ${blurClass}`}>
        {colors.map((color, index) => (
          <svg
            key={index}
            className="absolute"
            style={
              {
                top: `${Math.random() * 50}%`,
                left: `${Math.random() * 50}%`,
                animation: `background-gradient ${1 / speed * 100}s infinite alternate ease-in-out`,
                "--tx-1": Math.random() - 0.5,
                "--ty-1": Math.random() - 0.5,
                "--tx-2": Math.random() - 0.5,
                "--ty-2": Math.random() - 0.5,
                "--tx-3": Math.random() - 0.5,
                "--ty-3": Math.random() - 0.5,
                "--tx-4": Math.random() - 0.5,
                "--ty-4": Math.random() - 0.5,
              }
            }
            width={circleSize * randomInt(0.5, 1.5)}
            height={circleSize * randomInt(0.5, 1.5)}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="50"
              fill={color}
              className="opacity-30 dark:opacity-[0.15]"
            />
          </svg>
        ))}
      </div>
    </div>
  );
}
