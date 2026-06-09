import React, { useState } from 'react';
import { 
  Home, 
  Compass, 
  Library, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  LogOut,
  PlayCircle,
  MoreHorizontal
} from 'lucide-react';
import { logout } from '../api';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const navItems = [
    { icon: Home, label: 'Home' },
    { icon: Compass, label: 'Discover' },
    { icon: Library, label: 'My Library' },
    { icon: Settings, label: 'Settings' },
  ];

  const recentProjects = [
    { id: 1, title: 'Neon Nights', type: 'Animation', date: '2 days ago', color: 'from-purple-500 to-pink-500' },
    { id: 2, title: 'Cyberpunk City', type: 'Comic', date: '1 week ago', color: 'from-blue-500 to-cyan-500' },
    { id: 3, title: 'Fantasy Realm', type: 'Storyboard', date: '2 weeks ago', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col z-20">
        <div className="p-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 tracking-tight">
            Motionbook
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                    : 'text-[#888899] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-purple-400' : ''} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mb-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-white/5 text-[#888899] hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-md z-30">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666677]" size={18} />
            <input 
              type="text" 
              placeholder="Search projects, templates, or creators..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#666677] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="relative text-[#888899] hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-[#0a0a0f]"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 cursor-pointer">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">U</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-10 max-w-7xl w-full mx-auto">
          
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl p-8 mb-12 overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-black to-pink-900/20 z-0"></div>
            
            {/* Animated glowing orb behind text */}
            <div className="absolute top-1/2 left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back to Motionbook!</h2>
                <p className="text-[#a5a5b0] max-w-md">Ready to bring your stories to life? Continue where you left off or start a new masterpiece.</p>
              </div>
              <button className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Plus size={20} />
                <span>New Project</span>
              </button>
            </div>
          </motion.div>

          {/* Recent Projects Section */}
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Projects</h3>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project, i) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer"
              >
                {/* Project Thumbnail (Gradient Placeholder) */}
                <div className={`h-40 w-full bg-gradient-to-br ${project.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                      <PlayCircle className="text-white" size={24} />
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg group-hover:text-purple-400 transition-colors">{project.title}</h4>
                    <button className="text-[#666677] hover:text-white transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#888899]">
                    <span className="bg-white/10 px-2 py-1 rounded-md">{project.type}</span>
                    <span>Edited {project.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
