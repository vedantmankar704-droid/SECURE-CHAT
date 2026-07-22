const express = require('express');
const router = express.Router();
const { clearChat, deleteChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/chat/:chatId/clear
router.post('/:chatId/clear', protect, clearChat);

// DELETE /api/chat/:chatId
router.delete('/:chatId', protect, deleteChat);

module.exports = router;
