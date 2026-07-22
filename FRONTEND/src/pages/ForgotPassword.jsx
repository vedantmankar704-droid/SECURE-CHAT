import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ForgotPassword = ({ onNavigate }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password, 4: Success
  const [email, setEmail] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Resend Timer State
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  // Resend Timer effect
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage(data.message || 'OTP sent successfully!');
        setStep(2);
        setTimer(60);
        setCanResend(false);
      } else {
        setError(data.message || 'Failed to send OTP. Please check the email address.');
      }
    } catch (err) {
      console.error('Request OTP error:', err);
      setError('Cannot connect to backend server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otpInputs.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), otp: otpCode })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStep(3);
      } else {
        setError(data.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Cannot connect to backend server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage('A new OTP has been sent to your email.');
        setTimer(60);
        setCanResend(false);
        setOtpInputs(['', '', '', '', '', '']);
        // Refocus first box
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Cannot connect to backend server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const otpCode = otpInputs.join('');
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          otp: otpCode,
          newPassword
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStep(4);
      } else {
        setError(data.message || 'Failed to reset password. Please request a new OTP.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Cannot connect to backend server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // OTP box input navigation handlers
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otpInputs];
    newOtp[index] = value.slice(-1); // Take only last digit
    setOtpInputs(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      // Auto-focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const digits = pasteData.split('');
    setOtpInputs(digits);
    inputRefs.current[5]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700"
      >
        {/* Back Button */}
        {step < 4 && (
          <button
            onClick={() => {
              if (step === 1) onNavigate('login');
              else setStep((prev) => prev - 1);
            }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {/* Brand Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl text-white">🔒</span>
          </div>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
              Enter your registered email address. We will send you a 6-digit OTP to reset your password.
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3.5 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Verify OTP
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
              Enter the 6-digit OTP code sent to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>.
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3.5 rounded-xl text-sm mb-6 text-center">
                {error}
              </div>
            )}
            
            {message && !error && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-3.5 rounded-xl text-sm mb-6 text-center">
                {message}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otpInputs.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                ))}
              </div>

              {/* Resend Countdown */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                {!canResend ? (
                  <p>Resend OTP in <span className="font-bold text-primary">{timer}s</span></p>
                ) : (
                  <div className="space-y-1">
                    <p>Didn't receive OTP?</p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-primary hover:text-blue-700 font-semibold flex items-center gap-1.5 mx-auto focus:outline-none cursor-pointer"
                    >
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Resend OTP
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otpInputs.join('').length !== 6}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
              Create a new strong password for your account.
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-3.5 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success Screen */}
        {step === 4 && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={36} />
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Password Reset!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Your password has been successfully updated. You can now login with your new credentials.
            </p>

            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
