import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { PlayCircle, LogOut, Upload, X, ImageIcon, Video, Check, AlertCircle, Loader2, Film, TrendingUp, HardDrive, Eye, DollarSign } from "lucide-react";
import { uploadMotionbook, getMyMotionbooks, getMySubscription } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  
  // Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      fetchData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [mediaRes, subRes] = await Promise.all([
        getMyMotionbooks(),
        getMySubscription()
      ]);
      setMediaItems(mediaRes.data || []);
      setSub(subRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile || !videoFile || !title) {
      setError("Please provide a title, image, and video.");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", imageFile);
      formData.append("video", videoFile);
      await uploadMotionbook(formData);
      setSuccess(true);
      setTimeout(() => {
        setShowUploadModal(false);
        setSuccess(false);
        setImageFile(null);
        setVideoFile(null);
        setTitle("");
        fetchData();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(true);
      setTimeout(() => setUploading(false), 500); // smooth fake delay
    }
  };

  if (!user) return null;

  const isPremium = sub?.planType === "premium";
  const usedStorage = mediaItems.length;
  const totalStorage = isPremium ? 100 : 3;
  const storagePercent = (usedStorage / totalStorage) * 100;

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-24 pb-32 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="text-gray-400 text-sm">Manage your interactive albums and monitor your metrics.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e66000] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,107,0,0.3)]"
            >
              <Upload className="w-4 h-4" /> New Album
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>

        {/* Linear/Stripe Style Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Revenue */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3 text-gray-400 mb-4">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="font-medium text-sm">Monthly Revenue</span>
            </div>
            <div className="text-4xl font-bold tracking-tight text-white mb-2">$4,250</div>
            <div className="flex items-center gap-1 text-sm text-green-400 font-medium">
              <TrendingUp className="w-4 h-4" /> +12.5% this month
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-green-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-green-500/20 transition-colors" />
          </motion.div>

          {/* Views */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3 text-gray-400 mb-4">
              <Eye className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-sm">Album Scans</span>
            </div>
            <div className="text-4xl font-bold tracking-tight text-white mb-2">18.4k</div>
            <div className="flex items-center gap-1 text-sm text-blue-400 font-medium">
              <TrendingUp className="w-4 h-4" /> +8.2% this month
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
          </motion.div>

          {/* Albums Created */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-3 text-gray-400 mb-4">
              <Upload className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-sm">Active Albums</span>
            </div>
            <div className="text-4xl font-bold tracking-tight text-white mb-2">{usedStorage}</div>
            <div className="text-sm text-gray-500 font-medium">Across all clients</div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
          </motion.div>

          {/* Storage Limit */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-[#FF6B00]" />
                  <span className="font-medium text-sm">Storage Limit</span>
                </div>
                {!isPremium && <Link to="/pricing" className="text-xs text-[#FF6B00] hover:underline">Upgrade</Link>}
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold tracking-tight">{usedStorage}</span>
                <span className="text-gray-500 mb-1">/ {totalStorage}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mt-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${storagePercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${storagePercent > 90 ? 'bg-red-500' : 'bg-[#FF6B00]'}`}
              />
            </div>
          </motion.div>
        </div>

        {/* Albums Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Recent Albums</h2>
            <Link to="/scan" className="text-sm text-[#FF6B00] font-medium hover:text-[#e66000]">Open Scanner →</Link>
          </div>
          
          {mediaItems.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No albums yet</h3>
              <p className="text-gray-500 mb-6">Create your first interactive memory to get started.</p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-white/10 hover:bg-white/15 border border-white/10 px-6 py-2 rounded-full font-medium transition-colors"
              >
                Create Album
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mediaItems.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={item._id} 
                  className="group relative bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:border-[#FF6B00]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.15)]"
                >
                  <div className="aspect-[4/5] relative bg-black">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Hover Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-bold text-lg mb-1 truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {Math.floor(Math.random() * 500) + 10}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal (Glassmorphism) */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0f0f0f] border border-white/10 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Create New Album</h2>
                <button onClick={() => !uploading && setShowUploadModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Album Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The Smith Wedding"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all text-sm"
                    disabled={uploading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Image Upload Box */}
                  <div 
                    className={`relative aspect-square rounded-2xl border border-dashed cursor-pointer flex flex-col items-center justify-center transition-all overflow-hidden ${dragOver === "image" ? "border-[#FF6B00] bg-[#FF6B00]/10" : "border-white/10 hover:border-white/20 bg-white/[0.02]"}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver("image"); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(null); setImageFile(e.dataTransfer.files[0]); }}
                  >
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading} />
                    {imageFile ? (
                      <div className="absolute inset-0 p-2">
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full p-1"><Check className="w-4 h-4 text-green-400" /></div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-500 mb-3" />
                        <span className="text-xs text-gray-400 font-medium">Trigger Photo</span>
                      </>
                    )}
                  </div>

                  {/* Video Upload Box */}
                  <div 
                    className={`relative aspect-square rounded-2xl border border-dashed cursor-pointer flex flex-col items-center justify-center transition-all ${dragOver === "video" ? "border-purple-500 bg-purple-500/10" : videoFile ? "border-[#FF6B00]/40 bg-[#FF6B00]/5" : "border-white/10 hover:border-white/20 bg-white/[0.02]"}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver("video"); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(null); setVideoFile(e.dataTransfer.files[0]); }}
                  >
                    <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading} />
                    {videoFile ? (
                      <div className="flex flex-col items-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                          <Film className="w-6 h-6 text-[#FF6B00]" />
                        </div>
                        <span className="text-xs text-[#FF6B00] font-semibold break-all line-clamp-2">{videoFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Video className="w-8 h-8 text-gray-500 mb-3" />
                        <span className="text-xs text-gray-400 font-medium">Video Memory</span>
                      </>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-4 rounded-xl border border-green-400/20">
                    <Check className="w-4 h-4 shrink-0" />
                    <p>Album created successfully!</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || !title || !imageFile || !videoFile}
                  className="w-full py-4 bg-white text-black hover:bg-gray-200 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    "Upload Album"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
