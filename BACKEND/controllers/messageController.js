const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { getReceiverSocketId, getIO, activeConversations } = require('../socket/socket');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

// @desc    Send a message to a user
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { 
      receiverId, 
      content, 
      messageType, 
      imageUrl, 
      fileUrl, 
      fileName, 
      fileSize, 
      replyTo, 
      isForwarded,
      isEncrypted,
      encryptedMessage,
      encryptedAESKeyForSender,
      encryptedAESKeyForReceiver,
      iv,
      encryptedImageUrl,
      encryptedFileUrl,
      encryptedFileName
    } = req.body;
    const senderId = req.user;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required"
      });
    }

    // Verify friendship status
    const friendship = await FriendRequest.findOne({
      status: 'accepted',
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (!friendship) {
      return res.status(403).json({
        success: false,
        message: "You must be accepted friends to send messages"
      });
    }

    // Verify block status
    const senderDoc = await User.findById(senderId).select('blockedUsers');
    const receiverDoc = await User.findById(receiverId).select('blockedUsers');

    if (senderDoc?.blockedUsers?.map(id => id.toString()).includes(receiverId.toString())) {
      return res.status(400).json({
        success: false,
        message: "You have blocked this user"
      });
    }

    if (receiverDoc?.blockedUsers?.map(id => id.toString()).includes(senderId.toString())) {
      return res.status(400).json({
        success: false,
        message: "This user has blocked you"
      });
    }

    // Determine initial status based on recipient socket availability
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    const isReceiverViewing = activeConversations[receiverId.toString()] === senderId.toString();
    const initialStatus = isReceiverViewing ? 'seen' : (receiverSocketId ? 'delivered' : 'sent');

    // Encrypt content before saving to MongoDB
    const encryptedContent = content ? encryptMessage(content) : "";

    // 1. Save the message to database
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: encryptedContent,
      messageType: messageType || "text",
      imageUrl: imageUrl || "",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      fileSize: fileSize || 0,
      status: initialStatus,
      reactions: [],
      replyTo: replyTo || null,
      isForwarded: isForwarded || false,
      isEncrypted: isEncrypted || false,
      encryptedMessage: encryptedMessage || "",
      encryptedAESKeyForSender: encryptedAESKeyForSender || "",
      encryptedAESKeyForReceiver: encryptedAESKeyForReceiver || "",
      iv: iv || "",
      encryptedImageUrl: encryptedImageUrl || "",
      encryptedFileUrl: encryptedFileUrl || "",
      encryptedFileName: encryptedFileName || ""
    });
    await newMessage.save();

    if (newMessage.replyTo) {
      await newMessage.populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' }
      });
    }

    // 2. Find or create a Chat to update the lastMessage
    let previewText = "Sent an attachment";
    if (messageType === 'text' || !messageType) {
      previewText = content;
    } else if (messageType === 'image') {
      previewText = "📷 Image";
    } else if (messageType === 'file') {
      previewText = `📄 ${fileName || "Document"}`;
    }

    const encryptedPreviewText = previewText ? encryptMessage(previewText) : previewText;

    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        lastMessage: encryptedPreviewText,
        hiddenForUsers: [],
        unreadCounts: []
      });
    } else {
      chat.lastMessage = encryptedPreviewText;
      // Recreate conversation for both participants if hidden
      chat.hiddenForUsers = (chat.hiddenForUsers || []).filter(
        id => id.toString() !== senderId.toString() && id.toString() !== receiverId.toString()
      );
    }

    // Ensure unreadCounts array exists
    if (!chat.unreadCounts) {
      chat.unreadCounts = [];
    }

    // Reset unread count for sender (should be 0)
    const senderIdx = chat.unreadCounts.findIndex(u => u.userId.toString() === senderId.toString());
    if (senderIdx > -1) {
      chat.unreadCounts[senderIdx].count = 0;
    } else {
      chat.unreadCounts.push({ userId: senderId, count: 0 });
    }

    // If receiver is not actively viewing, increment unread count for receiver
    let newUnreadCount = 0;
    if (!isReceiverViewing) {
      const receiverIdx = chat.unreadCounts.findIndex(u => u.userId.toString() === receiverId.toString());
      if (receiverIdx > -1) {
        chat.unreadCounts[receiverIdx].count += 1;
        newUnreadCount = chat.unreadCounts[receiverIdx].count;
      } else {
        chat.unreadCounts.push({ userId: receiverId, count: 1 });
        newUnreadCount = 1;
      }
    }

    await chat.save();

    // Decrypt content for response payload
    const responsePayload = newMessage.toObject();
    responsePayload.content = decryptMessage(responsePayload.content);
    if (responsePayload.replyTo && responsePayload.replyTo.content) {
      responsePayload.replyTo.content = decryptMessage(responsePayload.replyTo.content);
    }

    res.status(201).json({
      success: true,
      message: responsePayload
    });

    // Emit newMessage and unreadUpdated events to the receiver via Socket.io
    const io = getIO();
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', responsePayload);
      if (!isReceiverViewing) {
        io.to(receiverSocketId).emit('unreadUpdated', {
          chatId: chat._id,
          userId: receiverId,
          count: newUnreadCount
        });
      }
    }
  } catch (error) {
    console.error(`Send message error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Get chat history between logged in user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const { userId } = req.params;

    const chat = await Chat.findOne({
      participants: { $all: [loggedInUserId, userId] }
    });

    let clearTimestamp = null;
    if (chat && chat.clearTimestamps) {
      const userCt = chat.clearTimestamps.find(
        t => t.userId.toString() === loggedInUserId.toString()
      );
      if (userCt) {
        clearTimestamp = userCt.timestamp;
      }
    }

    const query = {
      $or: [
        { sender: loggedInUserId, receiver: userId },
        { sender: userId, receiver: loggedInUserId }
      ],
      deletedForUsers: { $ne: loggedInUserId }
    };

    if (clearTimestamp) {
      query.createdAt = { $gt: clearTimestamp };
    }

    const messages = await Message.find(query).populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'name' }
    }).sort({ createdAt: 1 });

    const decryptedMessages = messages.map(msg => {
      const msgObj = msg.toObject();
      msgObj.content = decryptMessage(msgObj.content);
      if (msgObj.replyTo && msgObj.replyTo.content) {
        msgObj.replyTo.content = decryptMessage(msgObj.replyTo.content);
      }
      return msgObj;
    });

    res.status(200).json({
      success: true,
      messages: decryptedMessages
    });
  } catch (error) {
    console.error(`Get conversation error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Mark unread incoming messages as seen
// @route   PUT /api/messages/seen/:senderId
// @access  Private
const markAsSeen = async (req, res) => {
  try {
    const receiverId = req.user;
    const { senderId } = req.params;

    // Update status in MongoDB
    await Message.updateMany(
      { sender: senderId, receiver: receiverId, status: { $ne: 'seen' } },
      { status: 'seen' }
    );

    // Notify the sender in real-time via socket
    const senderSocketId = getReceiverSocketId(senderId.toString());
    if (senderSocketId) {
      const io = getIO();
      io.to(senderSocketId).emit('messagesSeen', {
        senderId: receiverId, // the user who read the messages
        receiverId: senderId
      });
      // Also support custom spec event messageSeen
      io.to(senderSocketId).emit('messageSeen', {
        senderId: receiverId,
        receiverId: senderId
      });
      // Emit messageRead event to sync client
      io.to(senderSocketId).emit('messageRead', {
        chatId: chat ? chat._id : null,
        senderId: receiverId,
        receiverId: senderId
      });
    }

    // Reset unread count for current user in Chat schema
    const chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });
    if (chat) {
      if (!chat.unreadCounts) {
        chat.unreadCounts = [];
      }
      const idx = chat.unreadCounts.findIndex(u => u.userId.toString() === receiverId.toString());
      if (idx > -1) {
        chat.unreadCounts[idx].count = 0;
      } else {
        chat.unreadCounts.push({ userId: receiverId, count: 0 });
      }
      await chat.save();

      // Emit unreadUpdated to the user who opened the chat
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      if (receiverSocketId) {
        const io = getIO();
        io.to(receiverSocketId).emit('unreadUpdated', {
          chatId: chat._id,
          userId: receiverId,
          count: 0
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Messages marked as seen"
    });
  } catch (error) {
    console.error(`Mark as seen error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Toggle reaction on a message
// @route   POST /api/messages/:messageId/react
// @access  Private
const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji reaction is required"
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    const existingIndex = message.reactions.findIndex(
      r => r.userId.toString() === userId.toString()
    );

    let isRemoved = false;
    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        // Toggle off if same emoji is clicked
        message.reactions.splice(existingIndex, 1);
        isRemoved = true;
      } else {
        // Update reaction emoji
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // Add reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Broadcast reaction update via socket events
    const io = getIO();
    const receiverSocketId = getReceiverSocketId(message.receiver.toString());
    const senderSocketId = getReceiverSocketId(message.sender.toString());

    const updatePayload = {
      messageId,
      reactions: message.reactions,
      senderId: message.sender,
      receiverId: message.receiver
    };

    // Spec custom events reactionAdded / reactionRemoved
    if (isRemoved) {
      const removedPayload = { messageId, userId };
      if (receiverSocketId) io.to(receiverSocketId).emit('reactionRemoved', removedPayload);
      if (senderSocketId) io.to(senderSocketId).emit('reactionRemoved', removedPayload);
    } else {
      const addedPayload = { messageId, userId, emoji };
      if (receiverSocketId) io.to(receiverSocketId).emit('reactionAdded', addedPayload);
      if (senderSocketId) io.to(senderSocketId).emit('reactionAdded', addedPayload);
    }

    // Generic fallback event
    if (receiverSocketId) io.to(receiverSocketId).emit('reactionUpdated', updatePayload);
    if (senderSocketId) io.to(senderSocketId).emit('reactionUpdated', updatePayload);

    res.status(200).json({
      success: true,
      reactions: message.reactions
    });
  } catch (error) {
    console.error(`Toggle reaction error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Upload file attachments (images or files)
// @route   POST /api/messages/upload
// @access  Private
const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload"
      });
    }

    // Convert Windows backslashes to forward slashes for static path URLs
    const relativePath = req.file.path.replace(/\\/g, '/');
    const fileUrl = `${req.protocol}://${req.get('host')}/${relativePath}`;

    const isImage = req.file.mimetype.startsWith('image/');

    res.status(200).json({
      success: true,
      file: {
        url: fileUrl,
        type: isImage ? 'image' : 'file',
        name: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error(`Upload attachment error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteType } = req.body; // 'me' or 'everyone'
    const userId = req.user;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    if (deleteType === 'everyone') {
      if (message.sender.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own messages for everyone"
        });
      }

      message.isDeleted = true;
      message.deletedForEveryone = true;
      message.deletedBy = userId;
      message.deletedAt = new Date();
      message.content = "This message was deleted";
      message.messageType = "text";
      message.imageUrl = "";
      message.fileUrl = "";
      message.fileName = "";
      message.fileSize = 0;
      message.reactions = []; // Clear reactions as per the prompt
      await message.save();

      // Update Chat lastMessage preview
      let chat = await Chat.findOne({
        participants: { $all: [message.sender, message.receiver] }
      });
      if (chat) {
        chat.lastMessage = "This message was deleted";
        await chat.save();
      }

      // Notify recipient and sender via Socket.IO
      const receiverSocketId = getReceiverSocketId(message.receiver.toString());
      const senderSocketId = getReceiverSocketId(message.sender.toString());
      const io = getIO();
      const deletePayload = {
        messageId: message._id,
        senderId: message.sender,
        receiverId: message.receiver
      };

      if (receiverSocketId) io.to(receiverSocketId).emit('messageDeleted', deletePayload);
      if (senderSocketId) io.to(senderSocketId).emit('messageDeleted', deletePayload);
    } else {
      // Delete for me
      if (!message.deletedForUsers.includes(userId)) {
        message.deletedForUsers.push(userId);
        await message.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error(`Delete message error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  markAsSeen,
  toggleReaction,
  uploadAttachment,
  deleteMessage
};
