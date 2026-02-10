const express = require('express');
const router = express.Router();
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

// GET /api/cards/:id - Get single card
// PUT /api/cards/:id - Update card
// DELETE /api/cards/:id - Delete card
router.route('/:id').get(getCard).put(updateCard).delete(deleteCard);

module.exports = router;
