import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { PlayCircle, LogOut, PlusCircle, Trash2, Upload, X, ImageIcon, Video, Copy, Check, AlertCircle, Loader2, Film } from "lucide-react";
import { logout, getMyMotionbooks, uploadMotionbook, deleteMotionbook, getMySubscription } from "../api";
import { useState, useEffect, useRef, useCallback } from "react";
import StorageBar from "./ui/StorageBar";

function UploadModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(null);
  const imageInputRef = useRef();
  const videoInputRef = useRef();

  const handleImageChange = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleVideoChange = (file) => {
    if (!file || !file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }
    setVideoFile(file);
    setError("");
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (type === "image") handleImageChange(file);
    else handleVideoChange(file);
  };

  const handleUpload = async () => {
    if (!title.trim()) { setError("Please enter a title."); return; }
    if (!imageFile) { setError("Please select a trigger photo."); return; }
    if (!videoFile) { setError("Please select a video."); return; }

    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("image", imageFile);
      fd.append("video", videoFile);
      const result = await uploadMotionbook(fd);
      onSuccess(result);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !uploading && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#fcf5eb]">New Motionbook</h2>
            <p className="text-sm text-gray-400 mt-0.5">Upload a photo + video pair</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wedding Day 2024"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ea3c12] focus:ring-1 focus:ring-[#ea3c12] transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Trigger Photo
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver("image"); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, "image")}
              onClick={() => imageInputRef.current.click()}
              className={`relative aspect-square rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all overflow-hidden ${dragOver === "image" ? "border-[#ea3c12] bg-[#ea3c12]/10" : "border-white/10 hover:border-white/20 bg-white/[0.02]"}`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-500 text-center px-2">Drop photo or click</span>
                </>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e.target.files[0])} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Video
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver("video"); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, "video")}
              onClick={() => videoInputRef.current.click()}
              className={`aspect-square rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all ${dragOver === "video" ? "border-purple-500 bg-purple-500/10" : videoFile ? "border-[#ea3c12]/40 bg-[#ea3c12]/5" : "border-white/10 hover:border-white/20 bg-white/[0.02]"}`}
            >
              {videoFile ? (
                <div className="flex flex-col items-center gap-2 px-2 text-center">
                  <Film className="w-8 h-8 text-[#ea3c12]" />
                  <span className="text-xs text-[#ea3c12]/80 break-all line-clamp-2">{videoFile.name}</span>
                </div>
              ) : (
                <>
                  <Video className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-500 text-center px-2">Drop video or click</span>
                </>
              )}
            </div>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoChange(e.target.files[0])} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 bg-[#fcf5eb] hover:bg-white text-[#111] py-3.5 rounded-xl font-bold transition-all text-sm disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload Motionbook</>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

function MotionbookCard({ mb, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const scanUrl = `${window.location.origin}/scan`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this motionbook?")) return;
    setDeleting(true);
    try {
      await deleteMotionbook(mb._id);
      onDelete(mb._id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-[#1c1c1c] border border-white/10 rounded-2xl overflow-hidden hover:border-[#ea3c12]/50 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden bg-black/40">
        <img
          src={mb.imageUrl}
          alt={mb.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 text-xs text-white">
          <PlayCircle className="w-3 h-3 text-[#ea3c12]" />
          <span>Video linked</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-3 truncate">{mb.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-all"
          >
            {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Share Scanner</>}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [motionbooks, setMotionbooks] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = useCallback(async () => {
    try {
      const [mbData, subData] = await Promise.all([
        getMyMotionbooks(),
        getMySubscription().catch(() => null)
      ]);
      setMotionbooks(mbData);
      setSubscription(subData);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-8 pb-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-[#111] border border-white/10 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#fcf5eb] flex items-center justify-center text-2xl font-bold text-[#111] shrink-0">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#fcf5eb]">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Current Plan Details */}
        {subscription && (
          <div className="bg-[#111] border border-white/10 rounded-[32px] p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-1/2 bg-[#ea3c12] rounded-r-xl" />
            <div className="pl-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#fcf5eb] mb-1">Your Plan</h2>
                  <p className="text-gray-400 text-sm">Manage your limits and storage</p>
                </div>
                <div className="bg-[#ea3c12]/10 border border-[#ea3c12]/30 text-[#ea3c12] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                  {subscription.planId?.name || 'Demo'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <StorageBar 
                    usedBytes={subscription.storageUsedBytes || 0} 
                    totalBytes={subscription.planId?.maxStorageBytes || 5 * 1024 * 1024 * 1024} 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 font-medium">Photos Used</span>
                    <span className="text-[#fcf5eb]">{subscription.photosUploaded || 0} / {subscription.planId?.maxPhotos || 100}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ea3c12] rounded-full"
                      style={{ width: `${Math.min(((subscription.photosUploaded || 0) / (subscription.planId?.maxPhotos || 100)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-right">
                <Link to="/pricing" className="text-sm font-semibold text-[#ea3c12] hover:text-[#d6330d] transition-colors">
                  Upgrade Plan →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Upload & Motionbooks */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#fcf5eb] tracking-tight">Your Motionbooks</h2>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-[#fcf5eb] hover:bg-white text-[#111] px-5 py-2.5 rounded-full font-bold transition-colors text-sm"
            >
              <PlusCircle className="w-4 h-4" /> Upload
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-[#ea3c12] animate-spin" />
            </div>
          ) : motionbooks.length === 0 ? (
            <div className="border border-white/10 bg-[#111] rounded-3xl py-16 text-center">
              <Film className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No motionbooks yet</h3>
              <p className="text-gray-400 text-sm mb-6">Create your first AR experience.</p>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-medium transition-colors text-sm"
              >
                Create Now
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {motionbooks.map((mb) => (
                  <MotionbookCard key={mb._id} mb={mb} onDelete={(id) => setMotionbooks(prev => prev.filter(m => m._id !== id))} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={(newMb) => {
              setMotionbooks(prev => [newMb, ...prev]);
              setShowUpload(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
