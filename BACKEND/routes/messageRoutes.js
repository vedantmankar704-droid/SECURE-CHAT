const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, markAsSeen, toggleReaction, uploadAttachment } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, sendMessage);
router.get('/:userId', protect, getConversation);
router.post('/upload', protect, upload.single('file'), uploadAttachment);
router.put('/seen/:senderId', protect, markAsSeen);
router.post('/:messageId/react', protect, toggleReaction);

module.exports = router;
