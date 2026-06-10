import { useRef, useEffect } from 'react';

export function WavePath({ className = '', ...props }) {
  const path = useRef(null);
  const progressRef = useRef(0);
  const xRef = useRef(0.2);
  const timeRef = useRef(Math.PI / 2);
  const reqIdRef = useRef(null);

  useEffect(() => {
    setPath(progressRef.current);
  }, []);

  const setPath = (progress) => {
    const width = window.innerWidth * 0.7;
    if (path.current) {
      path.current.setAttributeNS(
        null,
        'd',
        `M0 100 Q${width * xRef.current} ${100 + progress * 0.6}, ${width} 100`,
      );
    }
  };

  const lerp = (x, y, a) => x * (1 - a) + y * a;

  const manageMouseEnter = () => {
    if (reqIdRef.current) {
      cancelAnimationFrame(reqIdRef.current);
      resetAnimation();
    }
  };

  const manageMouseMove = (e) => {
    const { movementY, clientX } = e;
    if (path.current) {
      const pathBound = path.current.getBoundingClientRect();
      xRef.current = (clientX - pathBound.left) / pathBound.width;
      progressRef.current += movementY;
      setPath(progressRef.current);
    }
  };

  const manageMouseLeave = () => {
    animateOut();
  };

  const animateOut = () => {
    const newProgress = progressRef.current * Math.sin(timeRef.current);
    progressRef.current = lerp(progressRef.current, 0, 0.025);
    timeRef.current += 0.2;
    setPath(newProgress);
    if (Math.abs(progressRef.current) > 0.75) {
      reqIdRef.current = requestAnimationFrame(animateOut);
    } else {
      resetAnimation();
    }
  };

  const resetAnimation = () => {
    timeRef.current = Math.PI / 2;
    progressRef.current = 0;
  };

  return (
    <div className={`relative h-px w-[70vw] ${className}`} {...props}>
      <div
        onMouseEnter={manageMouseEnter}
        onMouseMove={manageMouseMove}
        onMouseLeave={manageMouseLeave}
        className="relative -top-5 z-10 h-10 w-full"
        style={{ cursor: 'default' }}
      />
      <svg className="absolute -top-[100px] h-[300px] w-full overflow-visible">
        <path ref={path} style={{ fill: 'none', stroke: 'currentColor' }} strokeWidth={1.5} />
      </svg>
    </div>
  );
}
