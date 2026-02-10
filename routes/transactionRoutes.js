const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams allows access to :cardId
const { 
  createTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction 
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// POST /api/cards/:cardId/transactions - Create transaction
// GET /api/cards/:cardId/transactions - Get all transactions for a card
router.route('/').post(createTransaction).get(getTransactions);

// PATCH /api/cards/:cardId/transactions/:id - Update transaction
// DELETE /api/cards/:cardId/transactions/:id - Delete transaction
router.route('/:id').patch(updateTransaction).delete(deleteTransaction);

module.exports = router;


