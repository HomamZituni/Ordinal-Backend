const Reward = require('../models/Reward');
const Card = require('../models/Card');
const Transaction = require('../models/Transaction');

// Map transaction categories to reward categories
const categoryMapping = {
  Dining: 'Gift Cards',
  Travel: 'Travel',
  Groceries: 'Gift Cards',
  Gas: 'Cash Back',
  Entertainment: 'Gift Cards',
  Shopping: 'Gift Cards',
  Bills: 'Statement Credit',
  Other: 'Cash Back'
};

// NBA Scoring Algorithm
const calculateNBAScore = (reward, userSpending) => {
  let score = 0;
  if (!userSpending.total || userSpending.total === 0) return 0;

  // 1️⃣ Base value efficiency
  const valuePerPoint = reward.value / reward.pointsCost;
  score += valuePerPoint * 150;

  // 2️⃣ Category relevance
  let categoryMatchBonus = 0;
  for (const [txCategory, rewardCategory] of Object.entries(categoryMapping)) {
    if (rewardCategory === reward.category && userSpending.categories[txCategory]) {
      const spendingPercent = userSpending.categories[txCategory] / userSpending.total;
      categoryMatchBonus += spendingPercent * 200;
    }
  }
  score += categoryMatchBonus;

  // 3️⃣ Merchant / keyword relevance
  let merchantBonus = 0;
  const rewardTitle = (reward.title || '').toLowerCase(); // FIXED: was reward.name

  Object.keys(userSpending.merchants).forEach(merchant => {
    const spendingPercent = userSpending.merchants[merchant] / userSpending.total;

    if (rewardTitle.includes(merchant)) merchantBonus += spendingPercent * 300;

    // Specific merchant hints
    if (
      (rewardTitle.includes('amazon') && merchant.includes('amazon')) ||
      (rewardTitle.includes('whole foods') && merchant.includes('whole foods')) ||
      (rewardTitle.includes('target') && merchant.includes('target')) ||
      (rewardTitle.includes('shell') && merchant.includes('shell')) ||
      (rewardTitle.includes('chevron') && merchant.includes('chevron')) ||
      (rewardTitle.includes('delta') && merchant.includes('delta')) ||
      (rewardTitle.includes('airbnb') && merchant.includes('airbnb')) ||
      (rewardTitle.includes('mcdonald') && merchant.includes('mcdonald')) ||
      (rewardTitle.includes('starbucks') && merchant.includes('starbucks')) ||
      (rewardTitle.includes('chipotle') && merchant.includes('chipotle')) ||
      (rewardTitle.includes('spotify') && merchant.includes('spotify')) ||
      (rewardTitle.includes('netflix') && merchant.includes('netflix'))
    ) {
      merchantBonus += spendingPercent * 400;
    }
  });

  score += merchantBonus;

  // 4️⃣ Penalty for very high point cost
  if (reward.pointsCost > 30000) score -= 15;

  return Math.round(Math.max(0, score) * 100) / 100;
};

// ------------------------
// Get NBA-ranked rewards for a specific card
// GET /api/cards/:id/rewards/ranked
exports.getRankedRewards = async (req, res) => {
  try {
    const { id: cardId } = req.params;
    const userId = req.user._id;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.user.toString() !== userId.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const transactions = await Transaction.find({ user: userId, card: cardId })
      .sort({ date: -1 })
      .limit(50);

    if (!transactions.length) {
      return res.status(200).json({
        message: 'No transactions found for this card. Add transactions to see personalized rankings.',
        rewards: []
      });
    }

    // Build spending summary
    const userSpending = { total: 0, categories: {}, merchants: {} };
    transactions.forEach(t => {
      userSpending.total += t.amount;
      userSpending.categories[t.category] = (userSpending.categories[t.category] || 0) + t.amount;
      const merchantName = t.merchant?.toLowerCase();
      if (merchantName) {
        userSpending.merchants[merchantName] = (userSpending.merchants[merchantName] || 0) + t.amount;
      }
    });

    const rewards = await Reward.find({ isActive: true });
    if (!rewards.length) return res.status(200).json({ message: 'No rewards available.', rewards: [] });

    const rankedRewards = rewards
      .map(r => ({ ...r.toObject(), nbaScore: calculateNBAScore(r, userSpending) }))
      .sort((a, b) => b.nbaScore - a.nbaScore)
      .slice(0, 20);

    res.status(200).json({
      message: 'Rewards ranked successfully for this card',
      rewards: rankedRewards,
      spendingAnalysis: userSpending
    });

  } catch (error) {
    console.error('Error in getRankedRewards:', error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------------
// Get all rewards for a card (existing)
// GET /api/cards/:id/rewards
exports.getCardRewards = async (req, res) => {
  try {
    const { id: cardId } = req.params;
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to view rewards for this card' });

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