const Card = require('../models/Card');
const Transaction = require('../models/Transaction');


// @desc    Create new card
// @route   POST /api/cards
// @access  Private
exports.createCard = async (req, res) => {
  try {
    const { cardName, issuer, cardType, rewardsTier, lastFourDigits, pointsBalance } = req.body;

    const card = await Card.create({
      cardName,
      issuer,
      cardType,
      rewardsTier,
      lastFourDigits,
      pointsBalance,
      user: req.user._id
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user's cards
// @route   GET /api/cards
// @access  Private
exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user._id });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single card
// @route   GET /api/cards/:id
// @access  Private
exports.getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check ownership
    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this card' });
    }

    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update card
// @route   PATCH /api/cards/:id
// @access  Private
exports.updateCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check ownership
    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this card' });
    }

    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete card
// @route   DELETE /api/cards/:id
// @access  Private
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check ownership
    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this card' });
    }

    // Delete child transactions first (avoid orphans)
    await Transaction.deleteMany({ card: card._id });

    // Then delete the card
    await Card.findByIdAndDelete(card._id);

    res.status(200).json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


