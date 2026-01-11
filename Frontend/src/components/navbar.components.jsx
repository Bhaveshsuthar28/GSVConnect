import { NavLink } from "react-router-dom";
import { Moon, Sun, Menu, User as UserIcon, LogOut, UserCircle, PenSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toggleTheme } from "../features/theme.js";
import { MobileSidebar } from "./moblie.sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Directory", path: "/directory" },
  { name: "Events", path: "/events" },
  { name: "About", path: "/about" },
];

export const Navbar = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleThemeToggle = () => {
    toggleTheme();
    setIsDark((p) => !p);
  };

  const handleProfileClick = () => {
    if (window.innerWidth < 1024) setOpen(true);
    else setShowDropdown((p) => !p);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <>
      <nav className="fixed top-5 left-0 w-full z-40 dark:bg-transparent backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <img
              src={`${import.meta.env.VITE_IMAGEKIT_URL}/Gati_Shakti_Vishwavidyalaya_Logo.png`}
              alt="GSV Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <p className="font-bold text-lg text-slate-900 dark:text-white">
                GSVConnect
              </p>
              <p className="text-xs text-slate-600 dark:text-white/80">
                Gati Shakti Vishwavidyalaya
              </p>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-3 text-sm font-semibold">
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black"
                      : "px-4 py-2 rounded-full border border-slate-300 text-slate-800 hover:bg-slate-200 transition dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-black"
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
            {isAuthenticated && (
              <li>
                <NavLink
                  to="/stories"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black"
                      : "px-4 py-2 rounded-full border border-slate-300 text-slate-800 hover:bg-slate-200 transition dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-black"
                  }
                >
                  Stories
                </NavLink>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <NavLink
                  to="/jobs"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black"
                      : "px-4 py-2 rounded-full border border-slate-300 text-slate-800 hover:bg-slate-200 transition dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-black"
                  }
                >
                  Jobs
                </NavLink>
              </li>
            )}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-full flex items-center justify-center transition border border-slate-300 text-slate-800 hover:bg-slate-200 dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={handleProfileClick}
                  className="w-10 h-10 rounded-full cursor-pointer overflow-hidden flex items-center justify-center font-bold bg-slate-900 text-white dark:bg-white dark:text-black"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || <UserIcon size={18} />
                  )}
                </div>

                {showDropdown && (
                  <div className="hidden lg:block absolute right-0 mt-3 w-48 rounded-xl shadow-xl overflow-hidden z-50 bg-white text-slate-900 border border-slate-200 dark:bg-slate-900 dark:text-white dark:border-slate-700">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {user?.role}
                      </p>
                    </div>

                    <NavLink
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserCircle size={16} />
                      Profile
                    </NavLink>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/auth"
                className="hidden lg:inline-block px-5 py-2 rounded-full font-semibold transition border border-slate-300 text-slate-800 hover:bg-slate-200 dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Join Us
              </NavLink>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => setOpen(true)}
                className="lg:hidden text-slate-800 dark:text-white"
              >
                <Menu size={26} />
              </button>
            )}
          </div>
        </div>
      </nav>

      <MobileSidebar open={open} onClose={() => setOpen(false)} />

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Confirm"
        cancelText="Cancel"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          setShowDropdown(false);
          logout();
        }}
      />
    </>
  );
};
