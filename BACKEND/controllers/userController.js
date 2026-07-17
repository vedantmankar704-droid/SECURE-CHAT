const User = require('../models/User');

// @desc    Get all users except current logged-in user
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    
    // Find all users except the current logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select('_id name username avatar isOnline');

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error(`Get users error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  getUsers
};
