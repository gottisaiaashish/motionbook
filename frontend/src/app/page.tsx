"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, PlayCircle, Layers, X, Star, CheckCircle2, Globe, MessageCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Hyperspeed from "@/components/Hyperspeed";

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30 overflow-hidden font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Motionbook</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#explore" className="hover:text-white transition-colors">Explore</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center min-h-screen">
        {/* Hyperspeed Background */}
        <div className="absolute inset-0 z-0 opacity-60">
          <Hyperspeed />
        </div>

        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>The future of digital storytelling</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Bring your stories to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              life with Motionbook.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10"
          >
            A premium platform to create, explore, and share breathtaking animated books and interactive experiences. 
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup" className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <button onClick={() => setShowDemo(true)} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors">
              <PlayCircle className="w-5 h-5" /> Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Floating UI Elements Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 relative w-full max-w-5xl mx-auto px-6"
        >
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <button onClick={() => setShowDemo(true)} className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                 <PlayCircle className="w-10 h-10 text-white ml-1" />
               </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Trusted By Section */}
      <section className="py-12 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-gray-500 mb-8 uppercase tracking-widest">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Fake Brand Logos */}
            {['Acme Corp', 'GlobalNet', 'Nexus', 'Starlight', 'Vortex'].map((brand) => (
              <div key={brand} className="text-xl font-bold font-serif italic text-gray-300">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400">Everything you need to create amazing motion books.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Fluid Animations", desc: "Create seamless transitions and interactions with our advanced editor." },
              { title: "Cloud Storage", desc: "Your projects are safely synced and accessible from anywhere." },
              { title: "Community", desc: "Share your work and collaborate with creators around the world." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="py-24 bg-[#0a0a0a] relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Explore Creations</h2>
              <p className="text-gray-400">Discover what others are building with Motionbook.</p>
            </div>
            <button className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2">
              View Gallery <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: item * 0.1 }}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item === 1 ? 'from-purple-500/40 to-indigo-500/40' : item === 2 ? 'from-pink-500/40 to-orange-500/40' : 'from-emerald-500/40 to-cyan-500/40'} mix-blend-overlay opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />
                <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                  <h3 className="text-xl font-bold mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Project Alpha {item}</h3>
                  <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">By CreatorName</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by Creators</h2>
            <p className="text-gray-400">See what our community has to say.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Jenkins", role: "Digital Artist", quote: "Motionbook completely changed how I present my comic portfolios. The animations are so smooth!" },
              { name: "David Chen", role: "Storyteller", quote: "The intuitive editor means I spend less time coding and more time crafting the perfect narrative." },
              { name: "Emma Wright", role: "UI Designer", quote: "A game-changer for interactive mockups. The export quality is simply unmatched." }
            ].map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/5"
              >
                <div className="flex text-yellow-500 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-300 italic mb-6">&quot;{review.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500" />
                  <div>
                    <h4 className="font-bold text-sm">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0a0a0a] relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-400">Start for free, upgrade when you need more power.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10"
            >
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-extrabold mb-6">$0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Up to 3 projects</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Basic animations</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Community support</li>
              </ul>
              <Link href="/signup" className="block text-center w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-colors">
                Start Free
              </Link>
            </motion.div>

            {/* Pro Tier */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/50 to-black border border-indigo-500/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <h3 className="text-2xl font-bold mb-2 text-indigo-100">Pro Creator</h3>
              <div className="text-4xl font-extrabold mb-6">$12<span className="text-lg text-indigo-300 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 text-indigo-100/80">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Unlimited projects</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Advanced 3D animations</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Priority support & 4K Export</li>
              </ul>
              <Link href="/signup" className="block text-center w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold transition-colors shadow-lg shadow-indigo-500/25">
                Upgrade to Pro
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-black"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to create magic?</h2>
          <p className="text-xl text-gray-400 mb-10">Join thousands of creators who are already using Motionbook.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            Start Creating Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <PlayCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">Motionbook</span>
              </Link>
              <p className="text-sm text-gray-500 mb-6">Empowering creators to build interactive stories without limits.</p>
              <div className="flex gap-4 text-gray-400">
                <a href="#" className="hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-gray-200">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link href="#explore" className="hover:text-indigo-400 transition-colors">Explore</Link></li>
                <li><Link href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
                <li><Link href="/changelog" className="hover:text-indigo-400 transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-200">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link></li>
                <li><Link href="/community" className="hover:text-indigo-400 transition-colors">Community</Link></li>
                <li><Link href="/templates" className="hover:text-indigo-400 transition-colors">Templates</Link></li>
                <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-200">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-indigo-400 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Motionbook Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                <PlayCircle className="w-16 h-16 text-indigo-500 mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">Demo Video Coming Soon</h3>
                <p className="text-gray-400">This placeholder will be replaced with an actual video component later.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
/ /  
 t r i g g e r  
 v e r c e l  
 b u i l d  
 