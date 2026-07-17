import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Shield, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

const Welcome = ({ onNavigate }) => {
  const [view, setView] = useState('default'); // 'default' | 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [loginData, setLoginData] = useState({
    identifier: '', // Username or Email
    password: '',
    rememberMe: false
  });
  
  const [registerData, setRegisterData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation States
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLoginForm = () => {
    const newErrors = {};
    if (!loginData.identifier.trim()) {
      newErrors.identifier = 'Username or Email is required';
    }
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    if (!registerData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!registerData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (registerData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!registerData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1000);
    }, 1200);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      showToast('Account created successfully! Redirecting...', 'success');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1000);
    }, 1200);
  };

  // SVG Chat Illustration Component
  const SVGChatIllustration = () => (
    <svg viewBox="0 0 500 400" className="w-full h-auto max-w-sm mx-auto drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background soft glowing circle */}
      <circle cx="250" cy="200" r="160" fill="url(#paint0_radial)" />
      
      {/* Floating element 1 (Small blue circle) */}
      <motion.circle 
        cx="110" cy="110" r="16" fill="#3B82F6" opacity="0.15" 
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating element 2 (Small cyan circle) */}
      <motion.circle 
        cx="390" cy="280" r="12" fill="#06B6D4" opacity="0.15" 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Main Laptop/Device Frame */}
      <g filter="url(#dropShadow)">
        <rect x="120" y="140" width="260" height="170" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="3" />
        <rect x="135" y="155" width="230" height="140" rx="10" fill="#F9FAFB" />
      </g>

      {/* Laptop Base (Minimalist keyboard representation) */}
      <path d="M90 310H410C420 310 425 315 425 320V322C425 325 420 330 410 330H90C80 330 75 325 75 322V320C75 315 80 310 90 310Z" fill="#E5E7EB" />
      <rect x="220" y="310" width="60" height="8" rx="4" fill="#D1D5DB" />

      {/* Chat Bubble Left (Outgoing - Blue) */}
      <motion.g 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        className="origin-bottom-left"
      >
        <path d="M150 200C150 188.954 158.954 180 170 180H280C291.046 180 300 188.954 300 200V225C300 236.046 291.046 245 280 245H170C158.954 245 150 236.046 150 225V200Z" fill="#3B82F6" />
        {/* Chat triangle pointer */}
        <path d="M150 225L140 235L150 240V225Z" fill="#3B82F6" />
        {/* Chat Content lines */}
        <rect x="170" y="195" width="90" height="6" rx="3" fill="white" fillOpacity="0.9" />
        <rect x="170" y="208" width="110" height="6" rx="3" fill="white" fillOpacity="0.9" />
        <rect x="170" y="221" width="60" height="6" rx="3" fill="white" fillOpacity="0.6" />
        {/* Double ticks */}
        <path d="M275 228L279 232L286 225M281 228L285 232L292 225" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </motion.g>

      {/* Chat Bubble Right (Incoming - Gray) */}
      <motion.g 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 100 }}
        className="origin-bottom-right"
      >
        <path d="M200 110C200 98.9543 208.954 90 220 90H330C341.046 90 350 98.9543 350 110V135C350 146.046 341.046 155 330 155H220C208.954 155 200 146.046 200 135V110Z" fill="#E5E7EB" />
        {/* Chat triangle pointer */}
        <path d="M350 135L360 145L350 150V135Z" fill="#E5E7EB" />
        {/* Chat Content lines */}
        <rect x="220" y="105" width="100" height="6" rx="3" fill="#374151" fillOpacity="0.8" />
        <rect x="220" y="118" width="70" height="6" rx="3" fill="#374151" fillOpacity="0.8" />
        <circle cx="330" cy="135" r="8" fill="#10B981" /> {/* User avatar indicator */}
      </motion.g>

      {/* Decorative Shields/Locks */}
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="330" y="225" width="36" height="36" rx="18" fill="#10B981" opacity="0.9" />
        <path d="M348 238V240M342.8 243H353.2C354.2 243 355 243.8 355 244.8V249.2C355 250.2 354.2 251 353.2 251H342.8C341.8 251 341 250.2 341 249.2V244.8C341 243.8 341.8 243 342.8 243ZM345 243V240C345 238.3 346.3 237 348 237C349.7 237 351 238.3 351 240V243H345Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>

      {/* Gradients and Filters definition */}
      <defs>
        <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" transform="translate(250 200) rotate(90) scale(160)">
          <stop stopColor="#3B82F6" stopOpacity="0.12" />
          <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        <filter id="dropShadow" x="100" y="130" width="300" height="210" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.08" />
        </filter>
      </defs>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg flex flex-col justify-between font-sans transition-colors duration-300">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-16">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column (Branding & Illustration) */}
          <div className="lg:col-span-6 flex flex-col text-center lg:text-left space-y-6 lg:space-y-8 select-none order-2 lg:order-1">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <Shield className="text-white" size={22} />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Secure<span className="text-primary">Chat</span>
                </h1>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">
                Fast, Secure & Simple Messaging
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto lg:mx-0">
                Create an account or log in to start secure conversations with your friends. End-to-end encryption ensures your private talks stay completely private.
              </p>
            </div>
            
            {/* Embedded Responsive SVG Illustration */}
            <div className="hidden sm:block">
              <SVGChatIllustration />
            </div>
          </div>

          {/* Right Column (Auth Card) */}
          <div className="lg:col-span-6 flex justify-center items-center order-1 lg:order-2">
            <motion.div
              layout
              className="bg-white dark:bg-darkSideBar w-full max-w-md p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                
                {/* 1. Default View */}
                {view === 'default' && (
                  <motion.div
                    key="default-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col space-y-6 py-4"
                  >
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Get Started</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Choose how you want to connect</p>
                    </div>

                    <div className="space-y-4">
                      {/* Create User ID Option */}
                      <button
                        onClick={() => setView('register')}
                        className="w-full flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-xl hover:bg-blue-50/30 dark:hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-primary">
                            <User size={24} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Create User ID</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Register a new secure chat identity</p>
                          </div>
                        </div>
                        <span className="text-gray-400 group-hover:text-primary transition-colors text-lg font-bold">➔</span>
                      </button>

                      {/* Login Option */}
                      <button
                        onClick={() => setView('login')}
                        className="w-full flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-xl hover:bg-blue-50/30 dark:hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 dark:bg-green-950/20 rounded-xl text-green-600">
                            <KeyRound size={24} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Login</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Access your chats using your credentials</p>
                          </div>
                        </div>
                        <span className="text-gray-400 group-hover:text-primary transition-colors text-lg font-bold">➔</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. Login View */}
                {view === 'login' && (
                  <motion.div
                    key="login-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Header with Back button */}
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        type="button"
                        onClick={() => {
                          setView('default');
                          setErrors({});
                        }}
                        className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Login</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Access secure chat portal</p>
                      </div>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {/* Username or Email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          Username or Email
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="identifier"
                            value={loginData.identifier}
                            onChange={handleLoginChange}
                            placeholder="you@example.com or username"
                            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                              errors.identifier ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20'
                            } rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-4 transition-all`}
                          />
                        </div>
                        {errors.identifier && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.identifier}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          Password
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            placeholder="••••••••"
                            className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border ${
                              errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20'
                            } rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-4 transition-all`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Remember Me */}
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <label className="flex items-center text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            name="rememberMe"
                            checked={loginData.rememberMe}
                            onChange={handleLoginChange}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/20 accent-primary"
                          />
                          <span className="ml-2">Remember me</span>
                        </label>
                      </div>

                      {/* Login Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shadow-primary/10 flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </button>

                      {/* Switch to Register */}
                      <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setView('register');
                            setErrors({});
                          }}
                          className="text-primary font-semibold hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                        >
                          Create User ID
                        </button>
                      </p>
                    </form>
                  </motion.div>
                )}

                {/* 3. Register View */}
                {view === 'register' && (
                  <motion.div
                    key="register-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Header with Back button */}
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        type="button"
                        onClick={() => {
                          setView('default');
                          setErrors({});
                        }}
                        className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create User ID</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Register new identity</p>
                      </div>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          Full Name
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="fullName"
                            value={registerData.fullName}
                            onChange={handleRegisterChange}
                            placeholder="John Doe"
                            className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border ${
                              errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20'
                            } rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-4 transition-all`}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          Username
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-semibold">@</span>
                          <input
                            type="text"
                            name="username"
                            value={registerData.username}
                            onChange={handleRegisterChange}
                            placeholder="johndoe"
                            className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border ${
                              errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20'
                            } rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-4 transition-all`}
                          />
                        </div>
                        {errors.username && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.username}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            placeholder="you@example.com"
                            className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border ${
                              errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20'
                            } rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-4 transition-all`}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          Password
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            placeholder="••••••••"
                            className={`w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border ${
                              errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20'
                            } rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-4 transition-all`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            placeholder="••••••••"
                            className={`w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border ${
                              errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary/20'
                            } rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-4 transition-all`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      {/* Create Account Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shadow-primary/10 flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
                      >
                        {loading ? 'Creating Identity...' : 'Create Account'}
                      </button>

                      {/* Switch to Login */}
                      <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setView('login');
                            setErrors({});
                          }}
                          className="text-primary font-semibold hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                        >
                          Login
                        </button>
                      </p>
                    </form>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2026 SecureChat. All rights reserved.
        </p>
      </footer>

    </div>
  );
};

export default Welcome;
