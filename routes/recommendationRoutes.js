const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams allows access to :cardId
const { 
  getRecommendations, 
  refreshRecommendations 
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// GET /api/cards/:cardId/recommendations - Get recommendations
router.route('/').get(getRecommendations);

// POST /api/cards/:cardId/recommendations/refresh - Refresh recommendations
router.route('/refresh').post(refreshRecommendations);

module.exports = router;
