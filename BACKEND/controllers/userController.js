const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Get all users except current logged-in user
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    
    // Find all users except the current logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select('_id name username avatar isOnline lastSeen bio phone');

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
        unreadCount: unreadCount || 0
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

module.exports = {
  getUsers
};
