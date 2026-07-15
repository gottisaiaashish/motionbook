import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlayCircle, Maximize, AlertCircle, ScanLine } from "lucide-react";
import { getMyMotionbooks } from "../api";

export default function ScanPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [scanning, setScanning] = useState(true);
  const [matchedVideo, setMatchedVideo] = useState(null);
  const [detectionState, setDetectionState] = useState("searching"); // searching, detecting, locked
  
  const videoRef = useRef(null);

  // Real AI detection for AR effect
  useEffect(() => {
    if (!scanning || matchedVideo) return;
    
    let isActive = true;
    let scanTimeout;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const performScan = async () => {
      if (!isActive) return;
      
      const video = videoRef.current;
      if (!video || video.readyState !== 4) {
        scanTimeout = setTimeout(performScan, 500);
        return;
      }
      
      try {
        // Draw frame to canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Downscale to save bandwidth (max width 400px)
        const targetWidth = 400;
        const scale = targetWidth / canvas.width;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = targetWidth;
        tempCanvas.height = canvas.height * scale;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
        
        const imageDataUrl = tempCanvas.toDataURL("image/jpeg", 0.6);

        // Import scanImage from api dynamically or if imported at top
        const { scanImage } = await import('../api.js');
        const result = await scanImage(imageDataUrl);
        
        if (result.match && isActive) {
          setDetectionState("detecting");
          setTimeout(() => {
            if (!isActive) return;
            setDetectionState("locked");
            setTimeout(() => {
              if (!isActive) return;
              setMatchedVideo(result.videoUrl);
              setScanning(false);
            }, 800);
          }, 300);
          return; // Stop scanning once matched
        }
      } catch (err) {
        console.error("Scan error", err);
      }
      
      if (isActive) {
        scanTimeout = setTimeout(performScan, 1000); // 1 scan per second
      }
    };

    scanTimeout = setTimeout(performScan, 1000);

    return () => {
      isActive = false;
      clearTimeout(scanTimeout);
    };
  }, [scanning, matchedVideo]);
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await getMyMotionbooks();
      setMediaItems(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Real Camera Feed using native WebRTC
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col font-sans">
      
      {/* Top Navbar overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link to="/" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center pointer-events-auto transition-transform hover:scale-110 border border-white/20">
          <X className="w-5 h-5 text-white" />
        </Link>
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <ScanLine className={`w-4 h-4 ${detectionState === 'locked' ? 'text-green-500' : 'text-[#FF6B00] animate-pulse'}`} />
          <span className="text-xs font-bold tracking-widest uppercase text-white">
            {detectionState === 'searching' ? 'Searching...' : detectionState === 'detecting' ? 'Analyzing...' : 'Target Locked'}
          </span>
        </div>
      </div>

      {/* Main Camera View */}
      <div className="relative flex-1 w-full h-full bg-black">
        {/* The actual camera feed */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />

        {/* AI Detection UI Overlay */}
        <AnimatePresence>
          {scanning && (
            <motion.div 
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {/* Detection Box */}
              <motion.div 
                animate={{ 
                  scale: detectionState === "searching" ? [0.98, 1.02, 0.98] : detectionState === "detecting" ? [1, 1.05, 1] : 1,
                  borderColor: detectionState === "locked" ? "#22c55e" : "#FF6B00",
                  boxShadow: detectionState === "locked" ? "0 0 40px rgba(34,197,94,0.4)" : "0 0 20px rgba(255,107,0,0)"
                }}
                transition={{ duration: 2, repeat: detectionState !== "locked" ? Infinity : 0 }}
                className="w-[85vw] max-w-md aspect-[3/4] border-2 relative rounded-3xl overflow-hidden transition-colors duration-300 bg-white/[0.01]"
              >
                {/* Corner Accents */}
                <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-3xl transition-colors duration-300 ${detectionState === 'locked' ? 'border-green-500' : 'border-[#FF6B00]'}`} />
                <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-3xl transition-colors duration-300 ${detectionState === 'locked' ? 'border-green-500' : 'border-[#FF6B00]'}`} />
                <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-3xl transition-colors duration-300 ${detectionState === 'locked' ? 'border-green-500' : 'border-[#FF6B00]'}`} />
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-3xl transition-colors duration-300 ${detectionState === 'locked' ? 'border-green-500' : 'border-[#FF6B00]'}`} />

                {/* Scanning Laser Line */}
                {detectionState !== "locked" && (
                  <motion.div 
                    animate={{ y: ["0%", "400%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1/4 bg-gradient-to-b from-transparent via-[#FF6B00]/20 to-transparent border-b border-[#FF6B00]/50"
                  />
                )}

                {/* Reticle Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <Maximize className={`w-12 h-12 ${detectionState === 'locked' ? 'text-green-500' : 'text-[#FF6B00]'}`} strokeWidth={1} />
                </div>
              </motion.div>
              
              <div className="absolute bottom-20 left-0 right-0 text-center">
                <p className="text-white/70 text-sm font-medium tracking-wide">
                  {detectionState === 'searching' && "Point camera at your physical photo"}
                  {detectionState === 'detecting' && "Hold still, analyzing image..."}
                  {detectionState === 'locked' && "Photo recognized. Loading memory..."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Player overlay when matched */}
        <AnimatePresence>
          {matchedVideo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            >
              <div className="w-full max-w-lg aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,107,0,0.2)] border border-white/10 relative">
                <video 
                  src={matchedVideo} 
                  autoPlay 
                  controls 
                  playsInline 
                  className="w-full h-full object-contain"
                />
                <button 
                  onClick={() => { setMatchedVideo(null); setScanning(true); setDetectionState("searching"); }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
