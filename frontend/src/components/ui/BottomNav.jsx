import { Link, useLocation } from "react-router-dom";
import { Home, Scan, Tag, User } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { label: "Home", icon: Home, route: "/" },
    { label: "Scan", icon: Scan, route: "/scan" },
    { label: "Pricing", icon: Tag, route: "/pricing" },
    { label: "Profile", icon: User, route: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around px-4 py-3 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = path === item.route || (item.route === "/" && path === "");
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.route}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-500"}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
