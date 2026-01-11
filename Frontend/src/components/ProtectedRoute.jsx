import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f5fb] dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="animate-pulse text-sm">Checking access...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
