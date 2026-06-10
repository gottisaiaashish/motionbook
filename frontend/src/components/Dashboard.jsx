import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { PlayCircle, LogOut, Upload, X, ImageIcon, Video, Check, AlertCircle, Loader2, Film, TrendingUp, HardDrive, Eye, DollarSign, Camera } from "lucide-react";
import { uploadMotionbook, getMyMotionbooks, getMySubscription } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  
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
      const [mediaRes, subRes] = await Promise.all([getMyMotionbooks(), getMySubscription()]);
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
      setTitle(""); setImageFile(null); setVideoFile(null);
      fetchData();
      setTimeout(() => { setShowUploadModal(false); setSuccess(false); }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (type === "image") setImageFile(file);
    else setVideoFile(file);
    if (!uploading) {
      setUploading(true);
      setTimeout(() => setUploading(false), 500);
    }
  };

  if (!user) return null;

  const isPremium = sub?.planType === "premium";
  const usedStorage = mediaItems.length;
  const totalStorage = isPremium ? 100 : 3;
  const storagePercent = (usedStorage / totalStorage) * 100;

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-32 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-gray-900">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="text-gray-500 text-sm">Manage your interactive albums and monitor your metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md"
            >
              <Upload className="w-4 h-4" /> New Album
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Revenue */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 text-gray-500 mb-4">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="font-medium text-sm">Monthly Revenue</span>
            </div>
            <div className="text-4xl font-bold tracking-tight text-gray-900 mb-2">$4,250</div>
            <div className="flex items-center gap-1 text-sm text-green-500 font-medium">
              <TrendingUp className="w-4 h-4" /> +12.5% this month
            </div>
          </motion.div>

          {/* Views */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 text-gray-500 mb-4">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-sm">Album Scans</span>
            </div>
            <div className="text-4xl font-bold tracking-tight text-gray-900 mb-2">18.4k</div>
            <div className="flex items-center gap-1 text-sm text-blue-500 font-medium">
              <TrendingUp className="w-4 h-4" /> +8.2% this month
            </div>
          </motion.div>

          {/* Albums */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 text-gray-500 mb-4">
              <Upload className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-sm">Active Albums</span>
            </div>
            <div className="text-4xl font-bold tracking-tight text-gray-900 mb-2">{usedStorage}</div>
            <div className="text-sm text-gray-400 font-medium">Across all clients</div>
          </motion.div>

          {/* Storage */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-gray-500 mb-4">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-sm">Storage Limit</span>
                </div>
                {!isPremium && <Link to="/pricing" className="text-xs text-blue-500 hover:underline font-medium">Upgrade</Link>}
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold tracking-tight text-gray-900">{usedStorage}</span>
                <span className="text-gray-400 mb-1">/ {totalStorage}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${storagePercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${storagePercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
              />
            </div>
          </motion.div>
        </div>

        {/* Albums Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Recent Albums</h2>
            <Link to="/scan" className="text-sm text-blue-500 font-medium hover:text-blue-600">Open Scanner →</Link>
          </div>
          
          {mediaItems.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl bg-gray-50">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">No albums yet</h3>
              <p className="text-gray-500 mb-6">Create your first interactive memory to get started.</p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-200 px-6 py-2 rounded-full font-medium transition-colors text-gray-700"
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
                  className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-[4/5] relative bg-gray-100">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                    
                    {/* Hover Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-gray-900" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-bold text-lg mb-1 truncate text-white">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
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

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white border border-gray-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Create New Album</h2>
                <button onClick={() => !uploading && setShowUploadModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Album Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The Smith Wedding"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    disabled={uploading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <div 
                    className={`relative aspect-square rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all overflow-hidden ${dragOver === "image" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver("image"); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, "image")}
                  >
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading} />
                    {imageFile ? (
                      <div className="absolute inset-0 p-2">
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1"><Check className="w-4 h-4 text-white" /></div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-3" />
                        <span className="text-xs text-gray-500 font-medium">Trigger Photo</span>
                      </>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div 
                    className={`relative aspect-square rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all ${dragOver === "video" ? "border-blue-500 bg-blue-50" : videoFile ? "border-blue-200 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver("video"); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, "video")}
                  >
                    <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading} />
                    {videoFile ? (
                      <div className="flex flex-col items-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                          <Film className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-xs text-blue-600 font-semibold break-all line-clamp-2">{videoFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Video className="w-8 h-8 text-gray-400 mb-3" />
                        <span className="text-xs text-gray-500 font-medium">Video Memory</span>
                      </>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-4 rounded-xl border border-green-200">
                    <Check className="w-4 h-4 shrink-0" />
                    <p>Album created successfully!</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || !title || !imageFile || !videoFile}
                  className="w-full py-4 bg-gray-900 text-white hover:bg-gray-800 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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
