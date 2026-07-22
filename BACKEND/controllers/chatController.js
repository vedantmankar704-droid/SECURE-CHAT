const Chat = require('../models/Chat');

// @desc    Clear Chat for the current user
// @route   POST /api/chat/:chatId/clear
// @access  Private
const clearChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    // Verify participant
    if (!chat.participants.map(id => id.toString()).includes(userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this chat"
      });
    }

    // Add or update user clearTimestamp
    const userTimestampIndex = chat.clearTimestamps.findIndex(
      t => t.userId.toString() === userId.toString()
    );
    if (userTimestampIndex > -1) {
      chat.clearTimestamps[userTimestampIndex].timestamp = Date.now();
    } else {
      chat.clearTimestamps.push({ userId, timestamp: Date.now() });
    }

    await chat.save();

    res.status(200).json({
      success: true,
      message: "Chat cleared successfully"
    });
  } catch (error) {
    console.error(`Clear chat error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// @desc    Delete Chat for the current user
// @route   DELETE /api/chat/:chatId
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    // Verify participant
    if (!chat.participants.map(id => id.toString()).includes(userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this chat"
      });
    }

    // Add user to hiddenForUsers if not already there
    const userHiddenIndex = chat.hiddenForUsers.findIndex(
      id => id.toString() === userId.toString()
    );
    if (userHiddenIndex === -1) {
      chat.hiddenForUsers.push(userId);
    }

    // Also clear existing messages timestamp for this user
    const userTimestampIndex = chat.clearTimestamps.findIndex(
      t => t.userId.toString() === userId.toString()
    );
    if (userTimestampIndex > -1) {
      chat.clearTimestamps[userTimestampIndex].timestamp = Date.now();
    } else {
      chat.clearTimestamps.push({ userId, timestamp: Date.now() });
    }

    await chat.save();

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully"
    });
  } catch (error) {
    console.error(`Delete chat error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  clearChat,
  deleteChat
};
