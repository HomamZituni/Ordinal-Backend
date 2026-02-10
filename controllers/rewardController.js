const Reward = require('../models/Reward');
const Card = require('../models/Card');

// @desc    Get all rewards for a card
// @route   GET /api/cards/:cardId/rewards
// @access  Private
exports.getRewards = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Check if card exists and user owns it
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view rewards for this card' });
    }

    // Get all active rewards that match or are below the card's tier
    const tierHierarchy = ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium'];
    const cardTierIndex = tierHierarchy.indexOf(card.rewardsTier);

    const rewards = await Reward.find({
      isActive: true,
      tier: { $in: tierHierarchy.slice(0, cardTierIndex + 1) }
    }).sort('pointsCost');

    res.status(200).json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
