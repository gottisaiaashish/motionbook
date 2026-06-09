import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { PlayCircle, LogOut, PlusCircle, Settings, LayoutDashboard } from "lucide-react";
import { logout } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/50 p-6 flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Motionbook</span>
        </Link>

        <nav className="flex-1 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-white font-medium">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 rounded-xl hover:text-white transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </a>
        </nav>

        <div className="mt-auto">
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Projects</h1>
              <p className="text-gray-400">Manage your animations and stories.</p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              <PlusCircle className="w-5 h-5" /> New Project
            </button>
          </div>

          {/* Empty State */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full border-2 border-dashed border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-white/[0.02]"
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <PlayCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-8 max-w-sm">Create your first Motionbook project to start bringing your stories to life.</p>
            <button className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Create Project
            </button>
          </motion.div>
        </div>
      </main>

    </div>
  );
}
