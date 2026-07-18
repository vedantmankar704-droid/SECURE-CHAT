const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      password: hashedPassword
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
        phone: user.phone || ""
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
      lastSeen: user.lastSeen
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

    // Construct the public URL of the uploaded image
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

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
    const { name, bio, phone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      { name, bio, phone },
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
        lastSeen: updatedUser.lastSeen
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

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  getCurrentUser,
  uploadAvatar,
  updateProfile
};

