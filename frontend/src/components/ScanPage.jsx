import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { scanImage } from "../api";
import {
  PlayCircle, X, ScanLine, Camera, CameraOff,
  ChevronLeft, Zap, Volume2, VolumeX,
} from "lucide-react";

// ─── Camera permission states ─────────────────────────────────────────────────
const STATE = {
  IDLE: "idle",
  REQUESTING: "requesting",
  ACTIVE: "active",
  DENIED: "denied",
  SCANNING: "scanning",
  MATCHED: "matched",
};

export default function ScanPage() {
  const videoRef = useRef(null);       // live camera feed
  const canvasRef = useRef(null);      // hidden capture canvas
  const overlayVideoRef = useRef(null); // matched video player
  const streamRef = useRef(null);       // MediaStream reference
  const intervalRef = useRef(null);     // scan interval

  const [cameraState, setCameraState] = useState(STATE.IDLE);
  const [match, setMatch] = useState(null);      // { title, videoUrl }
  const [muted, setMuted] = useState(false);
  const [scanAnim, setScanAnim] = useState(false); // brief scan pulse

  // ── Start Camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraState(STATE.REQUESTING);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraState(STATE.ACTIVE);
        };
      }
    } catch {
      setCameraState(STATE.DENIED);
    }
  }, []);

  // ── Stop Camera ───────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // ── Capture + Scan ────────────────────────────────────────────────────────
  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (cameraState === STATE.MATCHED) return; // already matched

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Capture at reduced resolution for faster transfer
    canvas.width = 320;
    canvas.height = Math.round(320 * (video.videoHeight / (video.videoWidth || 320)));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);

    setScanAnim(true);
    setTimeout(() => setScanAnim(false), 400);

    try {
      const result = await scanImage(dataUrl);
      if (result.match) {
        stopCamera();
        setMatch({ title: result.title, videoUrl: result.videoUrl });
        setCameraState(STATE.MATCHED);
      }
    } catch {
      // network / server error — keep scanning silently
    }
  }, [cameraState, stopCamera]);

  // ── Auto-start on mount ───────────────────────────────────────────────────
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // ── Polling scan every 1.5 s while camera is active ──────────────────────
  useEffect(() => {
    if (cameraState === STATE.ACTIVE) {
      intervalRef.current = setInterval(captureAndScan, 1500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [cameraState, captureAndScan]);

  // ── Auto-play matched video ───────────────────────────────────────────────
  useEffect(() => {
    if (cameraState === STATE.MATCHED && overlayVideoRef.current) {
      overlayVideoRef.current.play().catch(() => {});
    }
  }, [cameraState]);

  // ── Close matched video, restart camera ──────────────────────────────────
  const handleClose = () => {
    setMatch(null);
    setCameraState(STATE.IDLE);
    startCamera();
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans">
      {/* Hidden capture canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Live Camera Feed ── */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: cameraState === STATE.MATCHED ? "none" : "block" }}
      />

      {/* ── Camera inactive states ── */}
      <AnimatePresence>
        {(cameraState === STATE.IDLE || cameraState === STATE.REQUESTING || cameraState === STATE.DENIED) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 p-8 text-center"
          >
            {cameraState === STATE.DENIED ? (
              <>
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                  <CameraOff className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Camera Access Denied</h2>
                <p className="text-gray-400 text-sm mb-8 max-w-xs leading-relaxed">
                  Please allow camera access in your browser settings, then reload the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-white text-black rounded-2xl font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                  Reload Page
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 animate-pulse">
                  <Camera className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Starting Camera…</h2>
                <p className="text-gray-400 text-sm">Allow camera access when prompted</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AR Viewfinder Overlay (while scanning) ── */}
      {cameraState === STATE.ACTIVE && (
        <>
          {/* Dark vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)" }}
          />

          {/* Corner brackets */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              {/* Top-left */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-xl" />
              {/* Top-right */}
              <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-xl" />
              {/* Bottom-left */}
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-xl" />
              {/* Bottom-right */}
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-xl" />

              {/* Scan line sweep */}
              <motion.div
                animate={{ top: ["8%", "88%", "8%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
              />

              {/* Pulse on scan */}
              <AnimatePresence>
                {scanAnim && (
                  <motion.div
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.05 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 rounded-3xl border-2 border-indigo-400"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Status pill */}
          <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none">
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10"
            >
              <Zap className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-white font-medium">Point camera at a Motionbook photo</span>
            </motion.div>
          </div>
        </>
      )}

      {/* ── Top Bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-safe-top pt-5 pb-4"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <PlayCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">Motionbook</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white font-medium">Live Scanning</span>
        </div>
      </div>

      {/* ── Matched Video Overlay ── */}
      <AnimatePresence>
        {cameraState === STATE.MATCHED && match && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-black flex flex-col"
          >
            {/* Video player */}
            <div className="flex-1 relative overflow-hidden">
              <video
                ref={overlayVideoRef}
                src={match.videoUrl}
                muted={muted}
                loop
                playsInline
                controls={false}
                className="w-full h-full object-contain bg-black"
              />

              {/* Gradient overlay at top and bottom */}
              <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

              {/* Top controls */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-8">
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Now Playing</p>
                  <h2 className="text-white font-bold text-lg leading-tight">{match.title}</h2>
                </motion.div>

                {/* Mute + Close */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMuted((m) => !m)}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom: Scan Again */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleClose}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  <ScanLine className="w-4 h-4" />
                  Scan Another Photo
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Match Found Flash ── */}
      <AnimatePresence>
        {cameraState === STATE.MATCHED && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute inset-0 z-25 bg-indigo-500/30 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
