const express = require('express');
const router = express.Router();
const { 
  registerUser, loginUser, getProfile, getCurrentUser, uploadAvatar, updateProfile,
  forgotPassword, verifyOTP, resendOTP, resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/profile
router.get('/profile', protect, getProfile);

// GET /api/auth/me
router.get('/me', protect, getCurrentUser);

// POST /api/auth/upload-avatar
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

// PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

// Forgot Password OTP routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
