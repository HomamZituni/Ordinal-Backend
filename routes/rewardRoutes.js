const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCardRewards, getRankedRewards } = require('../controllers/rewardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// This router is mounted at /api/cards/:cardId/rewards
router.get('/', getCardRewards);
router.get('/ranked', getRankedRewards);

module.exports = router;
