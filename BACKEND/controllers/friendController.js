const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const Message = require('../models/Message');
const { getReceiverSocketId, getIO } = require('../socket/socket');
const { decryptMessage } = require('../utils/encryption');

// @desc    Search users by username or name
// @route   GET /api/friends/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(200).json({
        success: true,
        users: []
      });
    }

    const currentUserDoc = await User.findById(loggedInUserId).select('blockedUsers');
    const blockedList = currentUserDoc?.blockedUsers?.map(id => id.toString()) || [];

    // Search users matching username or name, excluding current user
    const users = await User.find({
      _id: { $ne: loggedInUserId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    }).select('_id name username avatar bio isOnline lastSeen blockedUsers publicKey').limit(20);

    // Fetch friendship status for each matching user
    const results = await Promise.all(users.map(async (u) => {
      const uId = u._id.toString();
      const isBlockedByUs = blockedList.includes(uId);
      const targetBlockedList = u.blockedUsers?.map(id => id.toString()) || [];
      const hasBlockedUs = targetBlockedList.includes(loggedInUserId.toString());

      if (isBlockedByUs || hasBlockedUs) {
        return {
          _id: u._id,
          name: u.name,
          username: u.username,
          avatar: u.avatar,
          bio: u.bio || '',
          friendshipStatus: 'blocked',
          requestId: null
        };
      }

      // Check existing FriendRequest record
      const reqDoc = await FriendRequest.findOne({
        $or: [
          { sender: loggedInUserId, receiver: u._id },
          { sender: u._id, receiver: loggedInUserId }
        ]
      });

      let friendshipStatus = 'none';
      let requestId = null;

      if (reqDoc) {
        requestId = reqDoc._id;
        if (reqDoc.status === 'accepted') {
          friendshipStatus = 'accepted';
        } else if (reqDoc.status === 'pending') {
          if (reqDoc.sender.toString() === loggedInUserId.toString()) {
            friendshipStatus = 'pending_sent';
          } else {
            friendshipStatus = 'pending_received';
          }
        } else if (reqDoc.status === 'declined') {
          friendshipStatus = 'none';
        }
      }

      return {
        _id: u._id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio || '',
        isOnline: u.isOnline,
        lastSeen: u.lastSeen,
        friendshipStatus,
        requestId
      };
    }));

    res.status(200).json({
      success: true,
      users: results
    });
  } catch (error) {
    console.error(`Search users error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Send a friend request
// @route   POST /api/friends/request
// @access  Private
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required"
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself"
      });
    }

    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check block relationship
    const senderUser = await User.findById(senderId).select('blockedUsers name username avatar bio');
    if (senderUser.blockedUsers?.map(id => id.toString()).includes(receiverId.toString()) ||
        receiverUser.blockedUsers?.map(id => id.toString()).includes(senderId.toString())) {
      return res.status(400).json({
        success: false,
        message: "Cannot send friend request to this user"
      });
    }

    // Check existing request
    let existingReq = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingReq) {
      if (existingReq.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: "You are already friends"
        });
      }
      if (existingReq.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: "A friend request is already pending"
        });
      }
      // If declined, update existing to pending with new sender/receiver
      existingReq.sender = senderId;
      existingReq.receiver = receiverId;
      existingReq.status = 'pending';
      await existingReq.save();
    } else {
      existingReq = new FriendRequest({
        sender: senderId,
        receiver: receiverId,
        status: 'pending'
      });
      await existingReq.save();
    }

    // Populate sender details for socket notification
    const requestPayload = {
      _id: existingReq._id,
      sender: {
        _id: senderUser._id,
        name: senderUser.name,
        username: senderUser.username,
        avatar: senderUser.avatar,
        bio: senderUser.bio
      },
      receiver: receiverId,
      status: 'pending',
      createdAt: existingReq.createdAt
    };

    // Socket notification
    try {
      const io = getIO();
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('friendRequestReceived', requestPayload);
      }
    } catch (e) {
      console.error("Socket emit failed in sendFriendRequest:", e.message);
    }

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      request: requestPayload
    });
  } catch (error) {
    console.error(`Send friend request error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Accept a friend request
// @route   POST /api/friends/accept/:requestId
// @access  Private
const acceptFriendRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const { requestId } = req.params;

    const requestDoc = await FriendRequest.findById(requestId);
    if (!requestDoc) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found"
      });
    }

    if (requestDoc.receiver.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to accept this friend request"
      });
    }

    requestDoc.status = 'accepted';
    await requestDoc.save();

    const currentUser = await User.findById(loggedInUserId).select('_id name username avatar bio isOnline lastSeen publicKey');
    const senderUser = await User.findById(requestDoc.sender).select('_id name username avatar bio isOnline lastSeen publicKey');

    // Notify sender via Socket.IO
    try {
      const io = getIO();
      const senderSocketId = getReceiverSocketId(requestDoc.sender.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('friendRequestAccepted', {
          requestId: requestDoc._id,
          user: {
            _id: currentUser._id,
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            bio: currentUser.bio,
            isOnline: currentUser.isOnline,
            lastSeen: currentUser.lastSeen,
            publicKey: currentUser.publicKey
          }
        });
      }
    } catch (e) {
      console.error("Socket emit failed in acceptFriendRequest:", e.message);
    }

    res.status(200).json({
      success: true,
      message: "Friend request accepted",
      friend: senderUser
    });
  } catch (error) {
    console.error(`Accept friend request error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Decline a friend request
// @route   POST /api/friends/decline/:requestId
// @access  Private
const declineFriendRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const { requestId } = req.params;

    const requestDoc = await FriendRequest.findById(requestId);
    if (!requestDoc) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found"
      });
    }

    if (requestDoc.receiver.toString() !== loggedInUserId.toString() &&
        requestDoc.sender.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this friend request"
      });
    }

    const senderId = requestDoc.sender.toString();
    await FriendRequest.findByIdAndDelete(requestId);

    // Socket notification if declined
    try {
      const io = getIO();
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('friendRequestDeclined', { requestId });
      }
    } catch (e) {}

    res.status(200).json({
      success: true,
      message: "Friend request declined"
    });
  } catch (error) {
    console.error(`Decline friend request error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Get pending friend requests (incoming & outgoing)
// @route   GET /api/friends/requests
// @access  Private
const getPendingRequests = async (req, res) => {
  try {
    const loggedInUserId = req.user;

    const incoming = await FriendRequest.find({
      receiver: loggedInUserId,
      status: 'pending'
    }).populate('sender', '_id name username avatar bio isOnline lastSeen');

    const outgoing = await FriendRequest.find({
      sender: loggedInUserId,
      status: 'pending'
    }).populate('receiver', '_id name username avatar bio isOnline lastSeen');

    res.status(200).json({
      success: true,
      incoming,
      outgoing
    });
  } catch (error) {
    console.error(`Get pending requests error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Get accepted friends list with chat metadata
// @route   GET /api/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const loggedInUserId = req.user;

    const currentUserDoc = await User.findById(loggedInUserId).select('blockedUsers');
    const blockedList = currentUserDoc?.blockedUsers?.map(id => id.toString()) || [];

    // Find all accepted friend requests involving loggedInUserId
    const acceptedRequests = await FriendRequest.find({
      status: 'accepted',
      $or: [
        { sender: loggedInUserId },
        { receiver: loggedInUserId }
      ]
    });

    const friendIds = acceptedRequests.map(r => 
      r.sender.toString() === loggedInUserId.toString() ? r.receiver : r.sender
    );

    // Fetch friend users
    const friends = await User.find({ _id: { $in: friendIds } })
      .select('_id name username avatar isOnline lastSeen bio phone blockedUsers publicKey');

    // Fetch latest message and unread count for each friend
    const friendsWithDetails = await Promise.all(friends.map(async (u) => {
      const latestMessage = await Message.findOne({
        $or: [
          { sender: loggedInUserId, receiver: u._id },
          { sender: u._id, receiver: loggedInUserId }
        ],
        deletedForUsers: { $ne: loggedInUserId }
      }).sort({ createdAt: -1 });

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
          previewText = decryptMessage(latestMessage.content);
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
        hasBlockedUs,
        publicKey: u.publicKey || ""
      };
    }));

    res.status(200).json({
      success: true,
      friends: friendsWithDetails
    });
  } catch (error) {
    console.error(`Get friends error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getPendingRequests,
  getFriends
};
