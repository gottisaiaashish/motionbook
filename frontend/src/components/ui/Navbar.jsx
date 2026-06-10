import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, ScanLine, Tag, User } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Scan", path: "/scan", icon: ScanLine },
    { name: "Pricing", path: "/pricing", icon: Tag },
  ];

  const isActive = (path) => location.pathname === path || (path === "/" && location.pathname === "");

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-200 py-3 shadow-sm"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tight text-gray-900">Motionbook</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Profile / CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-4 text-xl font-semibold p-4 rounded-2xl ${
                      active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    {link.name}
                  </Link>
                );
              })}
              <div className="w-full h-[1px] bg-gray-200 my-2" />
              <Link
                to="/profile"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white p-4 rounded-2xl text-lg font-bold"
              >
                <User className="w-5 h-5" />
                Go to Profile
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
