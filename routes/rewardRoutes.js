const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCardRewards, getRankedRewards } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

// Protect all reward routes
router.use(protect);

// GET /api/cards/:cardId/rewards - Get all rewards for a card
router.get('/:cardId/rewards', getCardRewards);

// GET /api/cards/:cardId/rewards/ranked - Get NBA-ranked rewards for a specific card
router.get('/:cardId/rewards/ranked', getRankedRewards);

module.exports = router;
