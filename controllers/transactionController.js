const Transaction = require('../models/Transaction');
const Card = require('../models/Card');

// @desc    Get all transactions for a card
// @route   GET /api/cards/:cardId/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Check if card exists and user owns it
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these transactions' });
    }

    const transactions = await Transaction.find({ card: cardId }).sort('-date');

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new transaction
// @route   POST /api/cards/:cardId/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { amount, merchant, category, description, date } = req.body;

    // Check if card exists and user owns it
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add transactions to this card' });
    }

    const transaction = await Transaction.create({
      card: cardId,
      user: req.user._id,
      amount,
      merchant,
      category,
      description,
      date: date || Date.now()
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PATCH /api/cards/:cardId/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    const { cardId, id } = req.params;

    // Check if card exists and user owns it
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify transaction belongs to this card
    if (transaction.card.toString() !== cardId) {
      return res.status(400).json({ message: 'Transaction does not belong to this card' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/cards/:cardId/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const { cardId, id } = req.params;

    // Check if card exists and user owns it
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify transaction belongs to this card
    if (transaction.card.toString() !== cardId) {
      return res.status(400).json({ message: 'Transaction does not belong to this card' });
    }

    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
