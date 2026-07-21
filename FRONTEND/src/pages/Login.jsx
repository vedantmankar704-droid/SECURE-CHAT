import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { API_BASE_URL } from '../config/api';

const Login = ({ onNavigate }) => {
  const { updateCurrentUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store JWT token and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Normalize User ID to match store structure (adding user.id from user._id)
        const normalizedUser = {
          ...data.user,
          id: data.user._id || data.user.id
        };

        updateCurrentUser(normalizedUser);

        // Redirect to dashboard
        onNavigate('dashboard');
      } else {
        setError(data.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Cannot connect to backend server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg"
          >
            <span className="text-3xl">💬</span>
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Sign in to continue to Message
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3.5 rounded-xl text-sm mb-6 flex items-center gap-2"
          >
            <span className="font-semibold">Error:</span> {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                required
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
               className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          {/* Remember Me & Forgot Password */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between text-sm"
          >
            <label className="flex items-center text-gray-900 dark:text-white">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="ml-2">Remember me</span>
            </label>
            <button
              type="button"
              className="text-primary hover:text-blue-700 font-medium"
            >
              Forgot password?
            </button>
          </motion.div>

          {/* Login Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                or
              </span>
            </div>
          </div>

          {/* Social Login */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.529v3.625h5.445c-0.092,1.479-1.144,2.735-2.425,3.585c0,0,1.926,1.448,2.425,3.585h-5.445c-1.481-0.968-2.427-2.531-2.427-4.292c0-1.761,0.946-3.324,2.427-4.292L12.545,10.529Z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Continue with Google
            </span>
          </motion.button>
        </form>

        {/* Sign Up Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-gray-600 dark:text-gray-400 mt-6"
        >
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-primary font-semibold hover:text-blue-700"
          >
            Sign up
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
