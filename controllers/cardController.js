const Card = require('../models/Card');

// @desc    Create new card
// @route   POST /api/cards
// @access  Private
exports.createCard = async (req, res) => {
  try {
    const { title, description, imageUrl, isPublic } = req.body;

    const card = await Card.create({
      title,
      description,
      imageUrl,
      isPublic,
      owner: req.user._id
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all cards (public + user's own)
// @route   GET /api/cards
// @access  Private
exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({
      $or: [{ isPublic: true }, { owner: req.user._id }]
    }).populate('owner', 'username email');

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
    const card = await Card.findById(req.params.id).populate('owner', 'username email');

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user can view this card
    if (!card.isPublic && card.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this card' });
    }

    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update card
// @route   PUT /api/cards/:id
// @access  Private
exports.updateCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check ownership
    if (card.owner.toString() !== req.user._id.toString()) {
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
    if (card.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this card' });
    }

    await Card.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
