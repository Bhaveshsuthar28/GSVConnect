import { NavLink } from "react-router-dom";
import { Moon, Sun, Menu, User as UserIcon, LogOut, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toggleTheme } from "../features/theme.js";
import { MobileSidebar } from "./moblie.sidebar.jsx";
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, logoutUser } from '../redux/slices/authSlice';

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Directory", path: "/directory" },
  { name: "Events", path: "/events" }, 
  { name: "Yearbook", path: "/yearbook" },
  { name: "About", path: "/about" }
];

export const Navbar = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && !user) {
        dispatch(fetchProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeToggle = () => {
    toggleTheme();
    setIsDark((prev) => !prev);
  };
  
  const handleProfileClick = () => {
    // If mobile/tablet (using simple width check or just rely on CSS visibility)
    // Actually, we can just check window width or use logic: 
    // "If sidebar is hidden (desktop), toggle dropdown. Else open sidebar".
    // But easier: The icon in navbar is visible on all screens now. 
    // On Mobile: Open Sidebar. On Desktop: Toggle Dropdown.
    if (window.innerWidth < 1024) {
        setOpen(true);
    } else {
        setShowDropdown(!showDropdown);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowDropdown(false);
  };

  return (
    <>
      <nav className="fixed top-5 left-0 w-full z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/d/d2/Gati_Shakti_Vishwavidyalaya_Logo.png"
              alt="GSV Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="leading-tight">
              <p className="text-white font-bold text-lg">
                GSVConnect
              </p>
              <p className="text-white/80 text-xs">
                Gati Shakti Vishwavidyalaya
              </p>
            </div>
          </NavLink>


          {/* Desktop Navigation (ONLY lg+) */}
          <ul className="hidden lg:flex items-center gap-3 text-sm font-semibold text-white">
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `
                    px-4 py-2 rounded-full
                    border border-white
                    transition-all
                    ${
                      isActive
                        ? "bg-white text-black"
                        : "hover:bg-white hover:text-black"
                    }
                    `
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="
                w-10 h-10 rounded-full
                border border-white
                text-white
                flex items-center justify-center
                hover:bg-white hover:text-black
                transition
              "
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Profile or Join Us */}
            {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                    <div 
                        onClick={handleProfileClick}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white lg:bg-white lg:text-black text-black font-bold border border-white cursor-pointer select-none overflow-hidden" 
                        title={user?.name || "User"}
                    >
                        {user?.profileImage ? (
                            <img 
                                src={user.profileImage} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={18} />
                        )}
                    </div>

                    {/* Desktop Dropdown */}
                    {showDropdown && (
                        <div className="hidden lg:block absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user?.role || "Student"}</p>
                            </div>
                            <NavLink 
                                to={user?.role === 'alumni' ? '/dashboard' : '/profile'} 
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                                onClick={() => setShowDropdown(false)}
                            >
                                <UserCircle size={16} />
                                Profile
                            </NavLink>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left"
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
                  className="
                    hidden lg:inline-block
                    px-5 py-2 rounded-full
                    border border-white
                    text-white font-semibold
                    hover:bg-white hover:text-black
                    transition
                  "
                >
                  Join Us
                </NavLink>
            )}

            {/* Hamburger (Mobile + Tablet) - Only show if NOT authenticated */}
            {!isAuthenticated && (
              <button
                onClick={() => setOpen(true)}
                className="lg:hidden text-white"
                aria-label="Open menu"
              >
                <Menu size={26} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile / Tablet Sidebar */}
      <MobileSidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
};
