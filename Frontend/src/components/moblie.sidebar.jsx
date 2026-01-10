import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
import {
  Home,
  Users,
  CalendarDays,
  BookOpen,
  Info,
  X,
  User,
  LogOut,
  UserCircle // Import new icons
} from "lucide-react";

const navLinks = [
  { name: "Home", path: "/", icon: Home },
  { name: "Directory", path: "/directory", icon: Users },
  { name: "Events", path: "/events", icon: CalendarDays },
  { name: "Yearbook", path: "/yearbook", icon: BookOpen },
  { name: "About", path: "/about", icon: Info }
];

export const MobileSidebar = ({ open, onClose }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  if (!open) return null;

  const handleLogout = () => {
    dispatch(logoutUser());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden top-5">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Sidebar Card */}
      <aside
        className="
          absolute right-4 top-16
          w-60
          max-h-[80vh]
          rounded-3xl
          bg-white
          p-4
          shadow-xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/d/d2/Gati_Shakti_Vishwavidyalaya_Logo.png"
              alt="GSV Logo"
              className="w-9 h-9 rounded-full object-contain"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">
                GSVConnect
              </p>
              <p className="text-xs text-gray-500">
                Alumni Network
              </p>
            </div>
          </div>

          <button onClick={onClose} aria-label="Close menu">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-3" />

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 text-sm">
          {navLinks.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `
                flex items-center gap-3
                px-3 py-2 rounded-xl
                font-medium
                transition
                ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                }
                `
              }
            >
              <Icon size={18} />
              {name}
            </NavLink>
          ))}

          {/* Profile & Logout if Authenticated */}
          {isAuthenticated && (
            <>
              {/* Profile Link */}
              <NavLink
                to={user?.role === 'alumni' ? '/dashboard' : '/profile'}
                onClick={onClose}
                className={({ isActive }) =>
                    `
                    flex items-center gap-3
                    px-3 py-2 rounded-xl
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                    `
                  }
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-[18px] h-[18px] rounded-full object-cover" />
                ) : (
                  <UserCircle size={18} />
                )}
                Profile
              </NavLink>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-3
                  px-3 py-2 rounded-xl
                  font-medium
                  transition
                  w-full text-left
                  text-red-600 hover:bg-red-50
                "
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Auth CTA if NOT Authenticated */}
        {!isAuthenticated && (
          <NavLink
            to="/auth"
            onClick={onClose}
            className="
              mt-4
              flex items-center justify-center
              rounded-xl
              px-3 py-2
              text-sm font-semibold
              bg-gray-900 text-white
              hover:bg-gray-800
              transition
            "
          >
            Join Us
          </NavLink>
        )}
      </aside>
    </div>
  );
};
