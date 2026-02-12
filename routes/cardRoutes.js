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
const { protect } = require('../middleware/authMiddleware');

// All routes are protected (require authentication)
router.use(protect);

// POST /api/cards - Create card
// GET /api/cards - Get all cards
router.route('/').post(createCard).get(getCards);
//gamification route
router.get('/gamification', getGamification);
// GET /api/cards/:id - Get single card
// PATCH /api/cards/:id - Update card
// DELETE /api/cards/:id - Delete card
router.route('/:id').get(getCard).patch(updateCard).delete(deleteCard);


module.exports = router;
