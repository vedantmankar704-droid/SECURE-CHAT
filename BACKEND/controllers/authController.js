const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validate fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check email uniqueness
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Check username uniqueness
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: "Username already taken"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      publicKey: req.body.publicKey || ""
    });

    // Save to database
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {
    console.error(`Registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar || "",
        bio: user.bio || "",
        phone: user.phone || "",
        publicKey: user.publicKey || ""
      }
    });

  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || "",
        phone: user.phone || "",
        isOnline: user.isOnline,
        publicKey: user.publicKey || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error(`Profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio || "",
      phone: user.phone || "",
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      publicKey: user.publicKey || ""
    });
  } catch (error) {
    console.error(`Get current user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Upload profile picture (avatar)
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file"
      });
    }

    // Convert Windows backslashes to forward slashes for static path URLs
    const relativePath = req.file.path.replace(/\\/g, '/');
    const fileUrl = `${req.protocol}://${req.get('host')}/${relativePath}`;

    // Update user document in MongoDB
    const user = await User.findByIdAndUpdate(
      req.user,
      { avatar: fileUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      avatar: fileUrl,
      user
    });
  } catch (error) {
    console.error(`Upload avatar error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, publicKey } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const updates = { name, bio, phone };
    if (publicKey !== undefined) {
      updates.publicKey = publicKey;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      updates,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio || "",
        phone: updatedUser.phone || "",
        isOnline: updatedUser.isOnline,
        lastSeen: updatedUser.lastSeen,
        publicKey: updatedUser.publicKey || ""
      }
    });
  } catch (error) {
    console.error(`Update profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Forgot Password - request OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with this email" });
    }

    // Rate limit check: 60s resend buffer
    const now = new Date();
    if (user.lastOTPRequest && (now - new Date(user.lastOTPRequest)) < 60000) {
      const waitTime = Math.ceil((60000 - (now - new Date(user.lastOTPRequest))) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitTime}s before requesting a new OTP.`
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    user.resetOTP = hashedOTP;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.otpAttempts = 0;
    user.lastOTPRequest = now;
    user.resetOTPVerified = false;

    await user.save();

    await sendOTPEmail(user.email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully to your registered email"
    });
  } catch (error) {
    console.error(`Forgot password error: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Brute force protection: Max 5 attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Maximum OTP attempts exceeded. Please request a new OTP."
      });
    }

    // Expiry check
    if (!user.resetOTP || !user.resetOTPExpires || new Date(user.resetOTPExpires) < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired or is invalid" });
    }

    // Verify code match
    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempts remaining.`
      });
    }

    // Code is valid
    user.resetOTPVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password."
    });
  } catch (error) {
    console.error(`Verify OTP error: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Rate limit check: 60s
    const now = new Date();
    if (user.lastOTPRequest && (now - new Date(user.lastOTPRequest)) < 60000) {
      const waitTime = Math.ceil((60000 - (now - new Date(user.lastOTPRequest))) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitTime}s before requesting a new OTP.`
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash and save
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    user.resetOTP = hashedOTP;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
    user.otpAttempts = 0;
    user.lastOTPRequest = now;
    user.resetOTPVerified = false;

    await user.save();

    await sendOTPEmail(user.email, otp);

    res.json({
      success: true,
      message: "A new OTP has been sent to your email"
    });
  } catch (error) {
    console.error(`Resend OTP error: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if OTP was verified
    if (!user.resetOTPVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP must be verified before resetting password"
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save password and clear OTP fields
    user.password = hashedPassword;
    user.resetOTP = "";
    user.resetOTPExpires = null;
    user.otpAttempts = 0;
    user.resetOTPVerified = false;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });
  } catch (error) {
    console.error(`Reset password error: ${error.message}`);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  getCurrentUser,
  uploadAvatar,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword
};

