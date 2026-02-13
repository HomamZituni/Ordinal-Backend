const express = require('express');
const router = express.Router();
const { getGamification } = require('../controllers/recommendationController');

const {
  createCard,
  getCards,
  getCard,
  updateCard,
  deleteCard
} = require('../controllers/cardController');

const {
  getCardRewards,        // Fetch all rewards for a card
  getRankedRewards       // Fetch ranked rewards for a card (NBA ranking)
} = require('../controllers/rewardController');

const { protect } = require('../middleware/authMiddleware');

// All routes are protected (require authentication)
router.use(protect);

// POST /api/cards - Create card
// GET /api/cards - Get all cards
router.route('/').post(createCard).get(getCards);

// GET /api/cards/gamification - Gamification route
router.get('/gamification', getGamification);

// GET /api/cards/:id - Get single card
// PATCH /api/cards/:id - Update card
// DELETE /api/cards/:id - Delete card
router.route('/:id').get(getCard).patch(updateCard).delete(deleteCard);

// NEW: GET /api/cards/:id/rewards - Get all rewards for this card
router.get('/:id/rewards', getCardRewards);

// NEW: GET /api/cards/:id/rewards/ranked - Get ranked rewards for this card
router.get('/:id/rewards/ranked', getRankedRewards);

module.exports = router;
