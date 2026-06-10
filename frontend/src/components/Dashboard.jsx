import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  PlayCircle, LogOut, PlusCircle, LayoutDashboard,
  Trash2, Upload, X, ImageIcon, Video, Scan,
  Copy, Check, AlertCircle, Loader2, Film, Zap,
} from "lucide-react";
import { logout, getMyMotionbooks, uploadMotionbook, deleteMotionbook, getMySubscription } from "../api";
import { useState, useEffect, useRef, useCallback } from "react";
import StorageBar from "./ui/StorageBar";
import PlanBadge from "./ui/PlanBadge";
import UpgradeBanner from "./ui/UpgradeBanner";

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(null); // 'image' | 'video' | null
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
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg bg-[#111114] border border-white/10 rounded-3xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">New Motionbook</h2>
            <p className="text-sm text-gray-400 mt-0.5">Upload a photo + video pair</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wedding Day 2024"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Image Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Trigger Photo
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver("image"); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, "image")}
              onClick={() => imageInputRef.current.click()}
              className={`relative aspect-square rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all overflow-hidden
                ${dragOver === "image" ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/20 bg-white/[0.02]"}`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-medium">Change</span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-500 text-center px-2">Drop photo or click</span>
                </>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e.target.files[0])} />
          </div>

          {/* Video Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Video
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver("video"); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, "video")}
              onClick={() => videoInputRef.current.click()}
              className={`aspect-square rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all
                ${dragOver === "video" ? "border-purple-500 bg-purple-500/10" : videoFile ? "border-purple-500/40 bg-purple-500/5" : "border-white/10 hover:border-white/20 bg-white/[0.02]"}`}
            >
              {videoFile ? (
                <div className="flex flex-col items-center gap-2 px-2 text-center">
                  <Film className="w-8 h-8 text-purple-400" />
                  <span className="text-xs text-purple-300 break-all line-clamp-2">{videoFile.name}</span>
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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-3.5 rounded-2xl font-semibold transition-all text-sm disabled:cursor-not-allowed"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload Motionbook</>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Motionbook Card ──────────────────────────────────────────────────────────
function MotionbookCard({ mb, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const scanUrl = `${window.location.origin}/scan`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteMotionbook(mb._id);
      onDelete(mb._id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-black/40">
        <img
          src={mb.imageUrl}
          alt={mb.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Video indicator overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 text-xs text-white">
          <PlayCircle className="w-3 h-3 text-indigo-400" />
          <span>Video linked</span>
        </div>
        {/* Delete confirm flash */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center">
                <p className="text-white text-sm font-medium mb-3">Delete this motionbook?</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs hover:bg-red-400 transition-colors flex items-center gap-1"
                  >
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-3 truncate">{mb.title}</h3>
        <div className="flex items-center gap-2">
          {/* Share Scan Link */}
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 text-xs font-medium transition-all border border-indigo-500/20"
          >
            {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Share Scanner</>}
          </button>
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all border border-white/5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [motionbooks, setMotionbooks] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = user?.name?.split(" ")[0] || "there";

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

  const handleUploadSuccess = (newMb) => {
    setMotionbooks((prev) => [newMb, ...prev]);
    setShowUpload(false);
  };

  const handleDelete = (id) => {
    setMotionbooks((prev) => prev.filter((mb) => mb._id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-white/5 bg-black/60 flex flex-col p-5 sticky top-0 h-screen">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <PlayCircle className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Motionbook</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1.5">
          <div className="flex items-center gap-3 px-3.5 py-2.5 bg-indigo-600/15 border border-indigo-500/20 rounded-xl text-indigo-300 text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" /> My Projects
          </div>
          <Link
            to="/scan"
            className="flex items-center gap-3 px-3.5 py-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all text-sm"
          >
            <Scan className="w-4 h-4" /> AR Scanner
          </Link>

          {subscription && (
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Plan</span>
                <Link to="/upgrade" className="text-xs text-indigo-400 hover:text-indigo-300">Upgrade</Link>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="mb-4">
                  <PlanBadge planType={subscription.planId?.type || 'demo'} planName={subscription.planId?.name || 'Demo Plan'} />
                </div>
                
                {/* Storage Bar */}
                <div className="mb-3">
                  <StorageBar 
                    usedBytes={subscription.storageUsedBytes || 0} 
                    totalBytes={subscription.planId?.maxStorageBytes || 5 * 1024 * 1024 * 1024} 
                  />
                </div>

                {/* Photos Limit */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Photos</span>
                    <span className="text-gray-300">{subscription.photosUploaded || 0} / {subscription.planId?.maxPhotos || 100}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(((subscription.photosUploaded || 0) / (subscription.planId?.maxPhotos || 100)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {firstName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">

          {/* Upgrade Banner */}
          {subscription && subscription.planId?.type === 'demo' && (
            <UpgradeBanner reason="demo_expiring_soon" />
          )}
          {subscription && subscription.storageUsedBytes >= (subscription.planId?.maxStorageBytes || 5 * 1024 * 1024 * 1024) && (
            <UpgradeBanner reason="storage_full" />
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
          >
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Welcome back, {firstName} 👋</p>
              <h1 className="text-3xl font-bold tracking-tight">My Motionbooks</h1>
              <p className="text-gray-500 text-sm mt-1">
                {motionbooks.length} project{motionbooks.length !== 1 ? "s" : ""} · Each links a photo to a video that plays on scan
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/scan"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-sm font-medium text-gray-300 hover:text-white transition-all"
              >
                <Scan className="w-4 h-4" /> Try Scanner
              </Link>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" /> New Motionbook
              </button>
            </div>
          </motion.div>

          {/* How it works banner */}
          {motionbooks.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6"
            >
              <h3 className="text-sm font-semibold text-indigo-300 mb-4 uppercase tracking-widest">How Motionbook Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <ImageIcon className="w-5 h-5 text-indigo-400" />, step: "1", label: "Upload a Photo", desc: "Any printed or displayed photo you want to bring to life" },
                  { icon: <Video className="w-5 h-5 text-purple-400" />, step: "2", label: "Link a Video", desc: "The video that plays when someone scans your photo" },
                  { icon: <Scan className="w-5 h-5 text-pink-400" />, step: "3", label: "Scan & Watch", desc: "Open /scan on any mobile — point camera at the photo → magic!" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Step {item.step}</p>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : motionbooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center border-2 border-dashed border-white/8 rounded-3xl py-20 text-center"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-5">
                <Film className="w-7 h-7 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">No Motionbooks yet</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">
                Upload your first photo + video pair to create an AR experience.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Create First Motionbook
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {motionbooks.map((mb) => (
                  <MotionbookCard key={mb._id} mb={mb} onDelete={handleDelete} />
                ))}
              </AnimatePresence>

              {/* Add More Card */}
              <motion.button
                layout
                onClick={() => setShowUpload(true)}
                className="aspect-video sm:aspect-auto rounded-2xl border-2 border-dashed border-white/8 hover:border-indigo-500/40 bg-white/[0.015] hover:bg-indigo-500/5 flex flex-col items-center justify-center gap-3 text-gray-600 hover:text-indigo-400 transition-all min-h-[180px] group"
              >
                <div className="w-10 h-10 rounded-xl border border-current/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">New Motionbook</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </main>

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
