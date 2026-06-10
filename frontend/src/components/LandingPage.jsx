import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { PlayCircle, ArrowRight, Camera, Zap, Cloud, Smartphone, Users, ChevronDown, CheckCircle2, Star, Maximize } from "lucide-react";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left">
        <h4 className="text-lg font-medium text-gray-900">{question}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-gray-500 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-500/20 font-sans overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative pt-44 pb-24 overflow-hidden flex flex-col items-center min-h-[85vh] justify-center">
        {/* Blue Gradient Background — same as pricing */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #2529f8 100%)",
          }}
        />
        
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 text-center w-full mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-[clamp(3rem,10vw,6rem)] font-extrabold tracking-tighter mb-6 leading-[1.05] text-gray-900 font-['Playfair_Display']"
          >
            Scan a Photo. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 italic font-['Playfair_Display']">
              Relive the Moment.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed font-light px-2"
          >
            MotionBook transforms ordinary photos into living, breathing memories using advanced AI and Augmented Reality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup" className="group relative flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-xl">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. How MotionBook Works */}
      <section className="py-32 relative z-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">It feels like magic.</h2>
            <p className="text-xl text-gray-500">Three simple steps to bring your memories to life.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Upload your video", desc: "Select a video from your gallery. We automatically extract the best frame to use as the trigger photo." },
              { num: "02", title: "Print the photo", desc: "Download the high-res trigger photo and print it for your physical photo album or canvas." },
              { num: "03", title: "Scan & Relive", desc: "Open the MotionBook app, point it at the physical photo, and watch the video magically play inside the frame." }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="group p-8 rounded-3xl bg-white border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="text-6xl font-black text-gray-100 mb-6 group-hover:text-blue-100 transition-colors">{step.num}</div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Interactive AR Demo */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-gray-900">Seamless AR Tracking</h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Our proprietary computer vision engine instantly recognizes your physical prints from any angle, lighting condition, or distance. No QR codes or ugly markers required.
            </p>
            <ul className="space-y-4">
              {["Lightning fast recognition", "Works offline", "Multi-photo tracking", "Perfect border alignment"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/2 relative h-[500px]">
            <motion.div 
              initial={{ rotateY: -10, rotateX: 5 }}
              whileHover={{ rotateY: 0, rotateX: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-white border-[8px] border-gray-100 rounded-[3rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex items-center justify-center transform-gpu perspective-[1000px]"
            >
              {/* Phone Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-100 rounded-full z-20 shadow-inner flex items-center justify-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                 <div className="w-12 h-1 rounded-full bg-gray-200"></div>
              </div>
              
              <div className="w-full h-full relative overflow-hidden bg-gray-50 rounded-[2.5rem]">
                <img 
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2564&auto=format&fit=crop" 
                  alt="Wedding Photo" 
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                />
                
                {/* Scanner Line */}
                <motion.div 
                  animate={{ y: ['-100%', '1000%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_20px_5px_rgba(59,130,246,0.7)] z-10"
                ></motion.div>

                {/* UI Overlay */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-[85%]">
                   <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4"
                   >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 rounded-full bg-blue-500 animate-ping absolute"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-500 relative"></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Recognizing Print...</p>
                        <p className="text-xs text-gray-500">Perfect alignment found</p>
                      </div>
                   </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Features (Bento Box) */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">Designed for creators.</h2>
            <p className="text-xl text-gray-500">Everything you need, packed into a beautiful interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
            <motion.div className="md:col-span-2 md:row-span-2 rounded-3xl bg-white border border-gray-200 overflow-hidden relative group p-8 hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Camera className="w-8 h-8 text-blue-500 mb-6 relative z-10" />
              <h3 className="text-3xl font-bold mb-4 text-gray-900 relative z-10">Pristine Quality</h3>
              <p className="text-gray-500 text-lg relative z-10">We maintain the original resolution of your videos, streaming them instantly without quality loss or buffering delays.</p>
            </motion.div>
            
            <motion.div className="md:col-span-2 rounded-3xl bg-white border border-gray-200 p-8 relative overflow-hidden group hover:shadow-xl transition-shadow">
              <Cloud className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Cloud Synced</h3>
              <p className="text-gray-500">Your albums are stored securely on our global CDN for instantaneous access.</p>
            </motion.div>

            <motion.div className="rounded-3xl bg-white border border-gray-200 p-8 relative overflow-hidden group hover:shadow-xl transition-shadow">
              <Smartphone className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">App-less Web AR</h3>
              <p className="text-gray-500 text-sm">Scan directly from the browser. No app download required for your clients.</p>
            </motion.div>

            <motion.div className="rounded-3xl bg-white border border-gray-200 p-8 relative overflow-hidden group hover:shadow-xl transition-shadow">
              <Zap className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Instant Setup</h3>
              <p className="text-gray-500 text-sm">Upload, process, and deploy in less than 60 seconds.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Photographer Solutions */}
      <section className="py-32 relative bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-8 border border-blue-100"
          >
            <Users className="w-4 h-4" /> For Professionals
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-gray-900">Elevate your photography business.</h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-500 mb-12">
            Offer MotionBooks as a premium add-on to your wedding, event, or portrait packages. Increase your revenue while providing clients with an unforgettable experience.
          </p>
          <div className="flex justify-center gap-6">
            <div className="text-left bg-white border border-gray-200 rounded-2xl p-6 w-64 shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-2">+40%</div>
              <div className="text-sm text-gray-500">Average increase in album package upsells.</div>
            </div>
            <div className="text-left bg-white border border-gray-200 rounded-2xl p-6 w-64 shadow-sm">
              <div className="text-3xl font-bold text-gray-900 mb-2">Zero</div>
              <div className="text-sm text-gray-500">Coding or technical knowledge required.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Stories */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-gray-900">Loved by visual storytellers.</h2>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
            {[
              { name: "Alex R.", role: "Wedding Photographer", quote: "I added MotionBook to my premium wedding packages. Clients literally cry when they scan their printed album and hear their vows play. It's incredible." },
              { name: "Samantha T.", role: "Digital Artist", quote: "The AR tracking is the most stable I've ever seen. It perfectly locks onto the frame even in low light at art exhibitions." },
              { name: "Michael B.", role: "Event Agency", quote: "We use it for corporate event photobooths. The wow factor is off the charts, and the backend management is so clean." }
            ].map((story, i) => (
              <div key={i} className="min-w-[350px] snap-center bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex text-blue-500 mb-6 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-lg text-gray-600 italic mb-8">&quot;{story.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200" />
                  <div>
                    <h4 className="font-bold text-gray-900">{story.name}</h4>
                    <p className="text-sm text-gray-500">{story.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-2">
            <FAQItem 
              question="Do clients need to download an app?" 
              answer="No! Our Web AR technology allows anyone to scan the photo directly using their smartphone browser. No app downloads required." 
            />
            <FAQItem 
              question="How long do the videos stay active?" 
              answer="Videos remain active indefinitely as long as your professional subscription is active. We handle all the cloud storage and streaming bandwidth." 
            />
            <FAQItem 
              question="Can I link multiple photos in one album?" 
              answer="Yes! You can upload hundreds of photos and videos to a single workspace, creating a fully interactive photo album." 
            />
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA */}
      <section className="py-32 relative overflow-hidden border-t border-gray-100">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #2529f8 100%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter text-gray-900">Start creating magic.</h2>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-gray-900 text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-gray-900">Motionbook</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-500">
            <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Motionbook Inc.
          </div>
        </div>
      </footer>

    </div>
  );
}
