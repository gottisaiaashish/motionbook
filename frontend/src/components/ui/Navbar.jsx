import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, LifeBuoy, Info, Camera, Cloud, Smartphone, Zap, User, ChevronDown } from "lucide-react";

// ─── Navigation Data ──────────────────────────────────────────────────────────
const navigationLinks = [
  { label: "Home", path: "/" },
  {
    label: "Features",
    submenu: true,
    type: "description",
    items: [
      { path: "/#features", label: "AR Scanner", description: "Scan any photo and watch it come alive with video.", icon: Camera },
      { path: "/#features", label: "Cloud Streaming", description: "Your videos stream instantly via global CDN.", icon: Cloud },
      { path: "/#features", label: "Web AR", description: "No app download — works directly in the browser.", icon: Smartphone },
    ],
  },
  { label: "Pricing", path: "/pricing" },
  {
    label: "About",
    submenu: true,
    type: "icon",
    items: [
      { path: "/", label: "Getting Started", icon: BookOpen },
      { path: "/scan", label: "Try AR Scanner", icon: LifeBuoy },
      { path: "/pricing", label: "Plans & Pricing", icon: Info },
    ],
  },
];

// ─── Desktop Dropdown ─────────────────────────────────────────────────────────
function NavDropdown({ link, isOpen, onOpen, onClose, onToggle }) {
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    onOpen();
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => onClose(), 150);
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={dropdownRef} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-md transition-colors outline-none ${
          isOpen ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        {link.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl shadow-black/[0.08] overflow-hidden min-w-[280px]">
              <ul className={`p-2 ${link.type === "description" ? "space-y-1" : "grid grid-cols-1 gap-1"}`}>
                {link.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 group"
                      >
                        {Icon && (
                          <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                            <Icon className="w-4 h-4 text-blue-500" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.label}</div>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/80 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">

          {/* Left — Hamburger + Logo + Nav */}
          <div className="flex items-center gap-2">

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="group relative w-8 h-8 flex items-center justify-center md:hidden"
              aria-expanded={mobileOpen}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path
                  d="M4 12L20 12"
                  className={`origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] ${
                    mobileOpen ? "translate-y-0 rotate-[315deg]" : "-translate-y-[7px]"
                  }`}
                />
                <path
                  d="M4 12H20"
                  className={`origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] ${
                    mobileOpen ? "rotate-45" : ""
                  }`}
                />
                <path
                  d="M4 12H20"
                  className={`origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] ${
                    mobileOpen ? "translate-y-0 rotate-[135deg]" : "translate-y-[7px]"
                  }`}
                />
              </svg>
            </button>

            {/* Logo + Desktop nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
                Motionbook
              </Link>

              {/* Desktop navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navigationLinks.map((link, index) =>
                  link.submenu ? (
                    <NavDropdown
                      key={index}
                      link={link}
                      isOpen={openDropdown === index}
                      onOpen={() => setOpenDropdown(index)}
                      onClose={() => setOpenDropdown(null)}
                      onToggle={() => setOpenDropdown(openDropdown === index ? null : index)}
                    />
                  ) : (
                    <Link
                      key={index}
                      to={link.path}
                      className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                        isActive(link.path) ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>
            </div>
          </div>

          {/* Right — Scan Button + Auth buttons */}
          <div className="flex items-center gap-3">
            <Link 
              to="/scan" 
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors border border-blue-100"
            >
              <Camera className="w-4 h-4" /> Scan Photo
            </Link>
            
            {isLoggedIn ? (
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-all shadow-sm"
              >
                <User className="w-4 h-4 text-white" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-full transition-all shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-white border-b border-gray-200 shadow-lg md:hidden"
          >
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-1">
              {navigationLinks.map((link, index) => (
                <div key={index}>
                  {link.submenu ? (
                    <div className="mb-2">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">
                        {link.label}
                      </div>
                      {link.items.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={i}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {Icon && <Icon className="w-4 h-4 text-blue-500" />}
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.path) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                  {/* Separator */}
                  {index < navigationLinks.length - 1 && (
                    <div className="h-px bg-gray-100 mx-3 my-1" />
                  )}
                </div>
              ))}

              {/* Mobile Scan & Auth */}
              <div className="h-px bg-gray-200 mx-1 my-3" />
              
              <Link
                to="/scan"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-600 border border-blue-100 py-3 rounded-xl text-sm font-bold mb-2"
              >
                <Camera className="w-4 h-4" /> Scan Photo
              </Link>
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-bold"
                >
                  <User className="w-4 h-4" /> Go to Dashboard
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-3 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-3 rounded-xl text-sm font-medium text-white bg-gray-900"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
