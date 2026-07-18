const express = require('express');
const router = express.Router();
const { getUsers, blockUser, unblockUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.post('/block/:userId', protect, blockUser);
router.post('/unblock/:userId', protect, unblockUser);

module.exports = router;
