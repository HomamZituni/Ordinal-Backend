const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  toggleAI 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// GET /api/users/me - Get user profile
// PATCH /api/users/me - Update user profile
router.route('/me').get(getProfile).patch(updateProfile);

// PATCH /api/users/me/ai-toggle - Toggle AI recommendations
router.route('/me/ai-toggle').patch(toggleAI);

module.exports = router;
