import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const apiBase = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  timeout: 20000,
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;

    const originalUrl = String(original?.url || "");
    const isAuthFlow =
      originalUrl.includes("/login") ||
      originalUrl.includes("/register") ||
      originalUrl.includes("/verify-email") ||
      originalUrl.includes("/auth/refresh-token") ||
      originalUrl.includes("/auth/logout");

    if (status === 401 && original && !original._retry && !isAuthFlow) {
      original._retry = true;
      try {
        refreshPromise ??= api.post("/auth/refresh-token");
        await refreshPromise;
        refreshPromise = null;
        return api(original);
      } catch (refreshErr) {
        refreshPromise = null;
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

const request = async (method, url, data) => api({ method, url, data });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationStep, setRegistrationStep] = useState("register");
  const [lastRegisteredEmail, setLastRegisteredEmail] = useState(null);

  const handleError = useCallback((err, fallback, { silent = false } = {}) => {
    const message = err?.response?.data?.message || err?.message || fallback;
    setError(message);
    if (!silent) toast.error(message);
    return message;
  }, []);

  const fetchProfile = useCallback(async ({ silent = false } = {}) => {
    try {
      const res = await request("get", "/auth/profile");
      setUser(res.data);
      if (res.data.role) setRole(res.data.role);
      setIsAuthenticated(true);
      setError(null);
      return res.data;
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      // Avoid noisy toasts on initial boot or expected unauthenticated state
      const isUnauthorized = err?.response?.status === 401;
      handleError(err, "Failed to fetch profile", { silent: silent || isUnauthorized });
      throw err;
    }
  }, [handleError]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchProfile({ silent: true });
      } catch {
        // ignore
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchProfile]);

  const login = useCallback(async ({ email, password, role: loginRole }) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = loginRole === "alumni" ? "/alumni/login" : "/students/login";
      await request("post", endpoint, { email, password });
      await fetchProfile();
      toast.success("Logged in successfully");
    } catch (err) {
      handleError(err, "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, handleError]);

  const register = useCallback(async ({ name, email, password, role: regRole }) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = regRole === "alumni" ? "/alumni/register" : "/students/register";
      await request("post", endpoint, { name, email, password });
      setRegistrationStep("otp");
      setLastRegisteredEmail(email);
      toast.success("OTP sent to your email");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Registration failed";
      const isOtpCooldown = /wait\s+before\s+requesting\s+another\s+otp/i.test(message);

      // If an OTP was recently sent, allow the user to proceed to the OTP screen instead
      // of blocking the flow.
      if (isOtpCooldown) {
        setRegistrationStep("otp");
        setLastRegisteredEmail(email);
        setError(message);
        toast(message);
        return;
      }

      handleError(err, "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const verifyOtp = useCallback(async ({ email, otp, role: otpRole }) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = otpRole === "alumni" ? "/alumni/verify-email" : "/students/verify-email";
      await request("post", endpoint, { email, otp });
      setRegistrationStep("completed");
      await fetchProfile();
      toast.success("Email verified");
    } catch (err) {
      handleError(err, "OTP verification failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, handleError]);

  const updateProfile = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = (role || user?.role) === "alumni" ? "/alumni/profile" : "/students/profile";
      const res = await api.patch(endpoint, formData);
      setUser(res.data);
      if (res.data.role) setRole(res.data.role);
      toast.success("Profile updated");
      return res.data;
    } catch (err) {
      handleError(err, "Update failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [role, user?.role, handleError]);

  const logout = useCallback(async () => {
    try {
      await request("post", "/auth/logout");
    } catch {
      // ignore
    } finally {
      setUser(null);
      setRole("student");
      setIsAuthenticated(false);
      setRegistrationStep("register");
      setLastRegisteredEmail(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    role,
    isAuthenticated,
    isInitializing,
    isLoading,
    error,
    registrationStep,
    lastRegisteredEmail,
    setRole,
    setError,
    login,
    register,
    verifyOtp,
    fetchProfile,
    updateProfile,
    logout,
  }), [user, role, isAuthenticated, isInitializing, isLoading, error, registrationStep, lastRegisteredEmail, login, register, verifyOtp, fetchProfile, updateProfile, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
