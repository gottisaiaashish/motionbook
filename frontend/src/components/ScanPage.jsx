import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { getMyMotionbooks } from "../api";

export default function ScanPage() {
  // Hardcoding a public test video since this is a public scanner
  const [videoUrl, setVideoUrl] = useState("https://cdn.aframe.io/videos/bunny.mp4");
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef(null);

  // When A-Frame target is found, play the video
  useEffect(() => {
    if (!videoUrl) return;

    // A-Frame sometimes takes a moment to mount the target entity
    const checkTarget = setInterval(() => {
      const target = document.querySelector('#target');
      if (target) {
        clearInterval(checkTarget);
        
        target.addEventListener('targetFound', () => {
          console.log("Target found");
          const vid = document.querySelector('#ar-video');
          if (vid) vid.play();
        });
        
        target.addEventListener('targetLost', () => {
          console.log("Target lost");
          const vid = document.querySelector('#ar-video');
          if (vid) vid.pause();
        });
      }
    }, 500);

    return () => clearInterval(checkTarget);
  }, [videoUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden font-sans">
      
      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link to="/" onClick={() => window.location.reload()} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center pointer-events-auto transition-transform hover:scale-110 border border-white/20">
          <X className="w-5 h-5 text-white" />
        </Link>
        <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/10">
          AR Mode Active
        </div>
      </div>

      {/* A-Frame Scene */}
      {videoUrl ? (
        <a-scene 
          mindar-image="imageTargetSrc: https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind; autoStart: true; maxTrack: 1" 
          color-space="sRGB" 
          renderer="colorManagement: true, physicallyCorrectLights" 
          vr-mode-ui="enabled: false" 
          device-orientation-permission-ui="enabled: false"
        >
          <a-assets>
            <video 
              id="ar-video" 
              src={videoUrl} 
              loop 
              crossOrigin="anonymous" 
              playsInline 
              muted 
            ></video>
          </a-assets>

          <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
          
          <a-entity id="target" mindar-image-target="targetIndex: 0">
            {/* The video is mapped to the photo area. 
                Adjust width and height based on the physical photo's aspect ratio.
                Assuming standard 4:3 photo in portrait mode => width: 1, height: 1.33 */}
            <a-video src="#ar-video" position="0 0 0" height="1.33" width="1" rotation="0 0 0"></a-video>
          </a-entity>
        </a-scene>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center h-full text-white px-4 text-center z-[100]">
          <p className="text-red-400 mb-4">{errorMsg}</p>
          <Link to="/" onClick={() => window.location.reload()} className="px-4 py-2 bg-white text-black rounded-full font-bold">Go to Home & Login</Link>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-white">Loading AR Experience...</div>
      )}
    </div>
  );
}
