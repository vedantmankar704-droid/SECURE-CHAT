const express = require('express');
const router = express.Router();
const {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getPendingRequests,
  getFriends
} = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, searchUsers);
router.post('/request', protect, sendFriendRequest);
router.post('/accept/:requestId', protect, acceptFriendRequest);
router.post('/decline/:requestId', protect, declineFriendRequest);
router.get('/requests', protect, getPendingRequests);
router.get('/', protect, getFriends);

module.exports = router;
