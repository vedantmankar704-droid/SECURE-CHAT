const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { getReceiverSocketId, getIO } = require('../socket/socket');

// @desc    Send a message to a user
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType, imageUrl, fileUrl, fileName, fileSize, replyTo, isForwarded } = req.body;
    const senderId = req.user;

    console.log("[Controller] Sending message:");
    console.log("Current User (Sender):", senderId);
    console.log("Receiver ID:", receiverId);

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required"
      });
    }

    // Determine initial status based on recipient socket availability
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    const initialStatus = receiverSocketId ? 'delivered' : 'sent';

    // 1. Save the message to database
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content || "",
      messageType: messageType || "text",
      imageUrl: imageUrl || "",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      fileSize: fileSize || 0,
      status: initialStatus,
      reactions: [],
      replyTo: replyTo || null,
      isForwarded: isForwarded || false
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

    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        lastMessage: previewText
      });
    } else {
      chat.lastMessage = previewText;
    }
    await chat.save();

    res.status(201).json({
      success: true,
      message: newMessage
    });
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

    console.log("[Controller] Loading conversation:");
    console.log("Current User:", loggedInUserId);
    console.log("Target Partner User:", userId);

    const messages = await Message.find({
      $or: [
        { sender: loggedInUserId, receiver: userId },
        { sender: userId, receiver: loggedInUserId }
      ],
      deletedBy: { $ne: loggedInUserId }
    }).populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'name' }
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages
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

      message.isDeletedForEveryone = true;
      message.content = "This message was deleted";
      message.messageType = "text";
      message.imageUrl = "";
      message.fileUrl = "";
      message.fileName = "";
      message.fileSize = 0;
      await message.save();

      // Update Chat lastMessage
      let chat = await Chat.findOne({
        participants: { $all: [message.sender, message.receiver] }
      });
      if (chat) {
        chat.lastMessage = "This message was deleted";
        await chat.save();
      }

      // Notify recipient via Socket
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
      if (!message.deletedBy.includes(userId)) {
        message.deletedBy.push(userId);
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
