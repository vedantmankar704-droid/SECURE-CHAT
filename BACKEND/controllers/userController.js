const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Get all users except current logged-in user
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    
    // Get logged-in user's blocked users
    const currentUserDoc = await User.findById(loggedInUserId).select('blockedUsers');
    const blockedList = currentUserDoc?.blockedUsers?.map(id => id.toString()) || [];

    // Find all users except the current logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select('_id name username avatar isOnline lastSeen bio phone blockedUsers');

    // Fetch latest message and unread count for each user
    const usersWithChatDetails = await Promise.all(users.map(async (u) => {
      // Find latest message between loggedInUserId and u._id
      const latestMessage = await Message.findOne({
        $or: [
          { sender: loggedInUserId, receiver: u._id },
          { sender: u._id, receiver: loggedInUserId }
        ],
        deletedForUsers: { $ne: loggedInUserId }
      }).sort({ createdAt: -1 });

      // Count unread messages sent by u._id to loggedInUserId
      const unreadCount = await Message.countDocuments({
        sender: u._id,
        receiver: loggedInUserId,
        status: { $ne: 'seen' }
      });

      let previewText = 'Click to start chatting';
      if (latestMessage) {
        if (latestMessage.isDeleted || latestMessage.deletedForEveryone) {
          if (latestMessage.sender.toString() === loggedInUserId.toString()) {
            previewText = '🚫 You deleted this message';
          } else {
            previewText = '🚫 This message was deleted';
          }
        } else if (latestMessage.messageType === 'image') {
          previewText = '📷 Image';
        } else if (latestMessage.messageType === 'file') {
          previewText = `📄 ${latestMessage.fileName || 'Document'}`;
        } else {
          previewText = latestMessage.content;
        }
      }

      const isBlocked = blockedList.includes(u._id.toString());
      const targetBlockedList = u.blockedUsers?.map(id => id.toString()) || [];
      const hasBlockedUs = targetBlockedList.includes(loggedInUserId.toString());

      return {
        _id: u._id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        isOnline: u.isOnline,
        lastSeen: u.lastSeen,
        bio: u.bio || '',
        phone: u.phone || '',
        lastMessage: previewText,
        lastMessageTime: latestMessage ? latestMessage.createdAt : null,
        unreadCount: unreadCount || 0,
        isBlocked,
        hasBlockedUs
      };
    }));

    res.status(200).json({
      success: true,
      users: usersWithChatDetails
    });
  } catch (error) {
    console.error(`Get users error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Block a user
// @route   POST /api/users/block/:userId
// @access  Private
const blockUser = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const { userId } = req.params;

    if (loggedInUserId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself"
      });
    }

    const currentUser = await User.findById(loggedInUserId);
    if (!currentUser.blockedUsers.includes(userId)) {
      currentUser.blockedUsers.push(userId);
      await currentUser.save();
    }

    res.status(200).json({
      success: true,
      message: "User blocked successfully"
    });
  } catch (error) {
    console.error(`Block user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Unblock a user
// @route   POST /api/users/unblock/:userId
// @access  Private
const unblockUser = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const { userId } = req.params;

    const currentUser = await User.findById(loggedInUserId);
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== userId.toString()
    );
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: "User unblocked successfully"
    });
  } catch (error) {
    console.error(`Unblock user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  getUsers,
  blockUser,
  unblockUser
};
