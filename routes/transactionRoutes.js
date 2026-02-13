const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams allows access to :cardId
const { 
  createTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction 
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const TransactionModel = require('../models/Transaction');


// All routes are protected
router.use(protect);


// Define the merchant and category arrays for generating transactions
const categories = [
  'Dining', 'Travel', 'Groceries', 'Gas', 'Entertainment', 'Shopping', 'Bills', 'Other'
];

const merchants = [
  'Whole Foods', 'Kroger', 'Starbucks', 'Chipotle', 'Delta Airlines',
  'Marriott Hotel', 'Shell Gas', 'BP', 'Netflix', 'Amazon',
  'Target', 'Walmart', 'CVS Pharmacy', 'Uber', 'Lyft'
];


// POST /api/cards/:cardId/transactions/generate - Generate random transactions
router.post('/generate', async (req, res) => {
  try {
    const { cardId } = req.params;
    
    // Generate 10-15 random transactions
    const numTransactions = Math.floor(Math.random() * 6) + 10;
    const generatedTransactions = [];
    
    for (let i = 0; i < numTransactions; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = Math.round((Math.random() * 490 + 10) * 100) / 100; // $10-$500
      
      // Random date in last 30 days
      const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      const transaction = await TransactionModel.create({
        user: req.user._id,
        card: cardId,
        merchant,
        amount,
        category,
        date
      });
      
      generatedTransactions.push(transaction);
    }
    
    res.status(201).json({ 
      message: `Generated ${numTransactions} transactions`,
      transactions: generatedTransactions 
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE /api/cards/:cardId/transactions/deleteAll - Delete all transactions
router.delete('/deleteAll', async (req, res) => {
  try {
    const { cardId } = req.params;
    
    const result = await TransactionModel.deleteMany({
      card: cardId,
      user: req.user._id
    });
    
    res.status(200).json({ 
      message: `Deleted ${result.deletedCount} transactions` 
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST /api/cards/:cardId/transactions - Create transaction
// GET /api/cards/:cardId/transactions - Get all transactions for a card
router.route('/').post(createTransaction).get(getTransactions);


// PATCH /api/cards/:cardId/transactions/:id - Update transaction
// DELETE /api/cards/:cardId/transactions/:id - Delete transaction
router.route('/:id').patch(updateTransaction).delete(deleteTransaction);


module.exports = router;





