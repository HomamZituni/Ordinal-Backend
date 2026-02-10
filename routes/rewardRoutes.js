const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams allows access to :cardId
const { getRewards } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// GET /api/cards/:cardId/rewards - Get all rewards for a card
router.route('/').get(getRewards);

module.exports = router;
