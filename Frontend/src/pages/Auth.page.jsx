import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Mail, Lock, User, SquareDot, Sun, Moon, ArrowLeft } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { BackgroundVideo } from '../components/video.background';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const [view, setView] = useState('login'); // 'login', 'register', 'otp'
  const navigate = useNavigate();
  const {
    isLoading,
    error,
    setError,
    isAuthenticated,
    lastRegisteredEmail,
    role,
    setRole,
    login,
    register,
    verifyOtp,
  } = useAuth();

  // Default role: Student
  useEffect(() => {
    if (!role) setRole('student');
  }, [role, setRole]);

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (validationError) setValidationError(null);
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setValidationError(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      otp: ''
    });
    if (error) setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Student Email Validation
    if (role === 'student' && view !== 'otp') {
        const email = formData.email;
        const gsvDomain = "@gsv.ac.in";
        // Flexible Regex to match username_branchYear@gsv.ac.in
        // Matches letters/dots/nums for name, then underscore, then letters for branch, then 2 digits for year
        const structureRegex = /^[a-zA-Z0-9.]+_[a-zA-Z]+\d{2}@gsv\.ac\.in$/;

        if (!email.endsWith(gsvDomain) || !structureRegex.test(email)) {
          const message = "Invalid Student Email. Format expected: name_branchYear@gsv.ac.in (e.g. john_cse24@gsv.ac.in)";
          setValidationError(message);
          toast.error(message);
          return;
        }
    }

    if (view === 'login') {
      if (!role) {
        const message = 'Please select Student or Alumni.';
        setValidationError(message);
        toast.error(message);
        return;
      }
      login({ email: formData.email, password: formData.password, role }).catch(() => {});
    } else if (view === 'register') {
      if (!role) {
        const message = 'Please select Student or Alumni.';
        setValidationError(message);
        toast.error(message);
        return;
      }
      register({ name: formData.name, email: formData.email, password: formData.password, role })
        .then(() => setView('otp'))
        .catch(() => {});
    } else if (view === 'otp') {
      if (!role) {
        const message = 'Please select Student or Alumni.';
        setValidationError(message);
        toast.error(message);
        return;
      }
      verifyOtp({ email: lastRegisteredEmail || formData.email, otp: formData.otp, role })
        .then(() => {
          setError(null);
          setView('login');
        })
        .catch(() => {});
    }
  };

  const handleGoogleLogin = () => {
    if (!role) {
      const message = 'Please select Student or Alumni.';
      setValidationError(message);
      toast.error(message);
      return;
    }

    // Redirect to backend Google Auth endpoint
    const endpoint = role === 'alumni'
      ? import.meta.env.VITE_GOOGLE_URL1
      : import.meta.env.VITE_GOOGLE_URL2;

    if (!endpoint) {
      const message = 'Google login is not configured for this role.';
      setValidationError(message);
      toast.error(message);
      return;
    }
    window.location.href = endpoint;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <BackgroundVideo />
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-0 transition-all duration-300"></div>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all flex items-center gap-2 group"
        aria-label="Back to Home"
      >
        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 transition-transform" />
        <span className="hidden sm:inline font-medium pr-1">Home</span>
      </button>

      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5 sm:h-6 sm:w-6" /> : <Moon className="h-5 w-5 sm:h-6 sm:w-6" />}
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 transition-all duration-300">
        <h2 className="mt-6 text-center text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {view === 'login' ? 'Welcome Back' : view === 'register' ? 'Join Our Community' : 'Verify Email'}
        </h2>
        <p className="mt-2 text-center text-base sm:text-lg text-gray-200 px-2">
           {view === 'login' ? 'Sign in to access your dashboard' : 'Connect with Gati Shakti Vishwavidyalaya'}
        </p>
        <p className="mt-2 text-center text-sm text-gray-300">
          {view === 'login' ? 'New here? ' : 'Already have an account? '}
          <button
            onClick={() => {
                setView(view === 'login' ? 'register' : 'login');
                setError(null);
                setValidationError(null);
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  otp: ''
                });
            }}
            className="font-medium text-white hover:text-gray-200 underline transition-colors"
          >
            {view === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-8 px-4 sm:rounded-xl sm:px-10 border border-white/20 dark:border-slate-700 transition-all duration-300">
            
          {/* Role Selector */}
          <div className="flex justify-center mb-6 space-x-4">
            <button
              onClick={() => handleRoleChange('student')}
              className={`px-4 py-2 rounded-md transition-colors font-medium ${role === 'student' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
            >
              Student
            </button>
            <button
              onClick={() => handleRoleChange('alumni')}
              className={`px-4 py-2 rounded-md transition-colors font-medium ${role === 'alumni' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
            >
              Alumni
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {validationError && <div className="text-red-600 dark:text-red-400 text-sm">{validationError}</div>}
            
            {view === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="focus:ring-slate-500 focus:border-slate-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl p-3 border transition-colors dark:placeholder-gray-500"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {view !== 'otp' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                  Email address {role === 'student' && '(must be @gsv.ac.in)'}
                </label>
                <div className="mt-1 relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="focus:ring-slate-500 focus:border-slate-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl p-3 border transition-colors dark:placeholder-gray-500"
                    placeholder="you@gsv.ac.in"
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {view !== 'otp' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                  Password
                </label>
                <div className="mt-1 relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange} 
                    className="focus:ring-slate-500 focus:border-slate-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl p-3 border transition-colors dark:placeholder-gray-500"
                    autoComplete="current-password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" /> : <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
                  </div>
                </div>
              </div>
            )}

            {view === 'otp' && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                  Enter OTP sent to {lastRegisteredEmail}
                </label>
                <div className="mt-1 relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SquareDot className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={formData.otp}
                    onChange={handleChange}
                    className="focus:ring-slate-500 focus:border-slate-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl p-3 border transition-colors dark:placeholder-gray-500"
                    placeholder="123456"
                  />
                </div>
              </div>
            )}

            {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl text-sm font-bold tracking-wide text-white bg-black dark:bg-white dark:text-black hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 transition-all duration-300"
              >
                {isLoading ? 'Processing...' : view === 'login' ? 'Sign in' : view === 'register' ? 'Register' : 'Verify OTP'}
              </button>
            </div>
          </form>

          {(view === 'login' || view === 'register') && (role === 'alumni' || role === 'student') && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 rounded-full transition-colors">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <div>
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm bg-white dark:bg-slate-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-300"
                  >
                    <span className="sr-only">Sign in with Google</span>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.373-1.133 8.52-3.293 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
