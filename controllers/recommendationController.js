const Card = require('../models/Card');
const Reward = require('../models/Reward');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get recommendations for a card
// @route   GET /api/cards/:cardId/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const user = await User.findById(req.user._id);

    let rewards = await Reward.find({ isActive: true });

    const recentTransactions = await Transaction.find({ card: cardId })
      .sort('-date')
      .limit(20);

    // Apply NBA scoring if AI is enabled
    if (user.aiEnabled) {
      rewards = rewards.map((reward) => ({
        ...reward.toObject(),
        nbaScore: calculateNBAScore(reward, card, recentTransactions),
      }));
      rewards.sort((a, b) => b.nbaScore - a.nbaScore);
    } else {
      rewards.sort((a, b) => a.pointsCost - b.pointsCost);
    }

    // Banner gamification reward adder
    const topRewards = rewards.slice(0, 3);
    const featuredReward =
      topRewards.length > 0
        ? topRewards[Math.floor(Math.random() * topRewards.length)]
        : null;

    const gamification = calculateGamification(
      card,
      recentTransactions,
      featuredReward ? [featuredReward] : []
    );

    res.status(200).json({
      aiEnabled: user.aiEnabled,
      gamification,
      recommendations: rewards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh recommendations
// @route   POST /api/cards/:cardId/recommendations/refresh
// @access  Private
exports.refreshRecommendations = async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const user = await User.findById(req.user._id);

    let rewards = await Reward.find({ isActive: true });

    const recentTransactions = await Transaction.find({ card: cardId })
      .sort('-date')
      .limit(20);

    if (user.aiEnabled) {
      rewards = rewards.map((reward) => ({
        ...reward.toObject(),
        nbaScore: calculateNBAScore(reward, card, recentTransactions),
      }));
      rewards.sort((a, b) => b.nbaScore - a.nbaScore);
    } else {
      rewards.sort((a, b) => a.pointsCost - b.pointsCost);
    }

    // Pick top 3 dynamically scored rewards for banner
    const topRewards = rewards.slice(0, 3);
    const featuredReward =
      topRewards.length > 0
        ? topRewards[Math.floor(Math.random() * topRewards.length)]
        : null;

    const gamification = calculateGamification(
      card,
      recentTransactions,
      featuredReward ? [featuredReward] : []
    );

    res.status(200).json({
      message: 'Recommendations refreshed',
      aiEnabled: user.aiEnabled,
      gamification,
      recommendations: rewards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get gamification insights across all cards
// @route   GET /api/cards/gamification
// @access  Private
exports.getGamification = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user._id });
    if (!cards || cards.length === 0)
      return res.status(404).json({ message: 'No cards found' });

    const gamificationData = [];

    for (const card of cards) {
      const recentTransactions = await Transaction.find({ card: card._id })
        .sort('-date')
        .limit(20);

      const gamification = calculateGamification(card, recentTransactions, []);

      gamificationData.push({
        cardId: card._id,
        cardName: card.cardName,
        ...gamification,
      });
    }

    res.status(200).json(gamificationData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: Calculate NBA score (rules-based for MVP)
const calculateNBAScore = (reward, card, transactions) => {
  let score = 0;

  if (card.pointsBalance >= reward.pointsCost) {
    score += 50;
  } else {
    const percentAffordable = (card.pointsBalance / reward.pointsCost) * 100;
    score += percentAffordable * 0.3;
  }

  const valuePerPoint = (reward.value / reward.pointsCost) * 100;
  score += valuePerPoint * 0.5;

  if (transactions.length > 0) {
    const categoryCount = {};
    transactions.forEach((t) => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });

    const rewardToCategoryMapping = {
      '5% Cash Back on Dining': ['Dining'],
      '$50 Restaurant.com Gift Card': ['Dining'],
      '$100 DoorDash Credit': ['Dining'],
      'Gourmet Dinner Experience': ['Dining'],
      'Round-Trip Domestic Flight': ['Travel'],
      'Hotel Stay (2 Nights)': ['Travel'],
      '$200 Airbnb Credit': ['Travel'],
      '3% Travel Bonus': ['Travel'],
      '4% Cash Back on Gas': ['Gas'],
      '$75 Shell Gas Card': ['Gas'],
      'Free Car Wash Package': ['Gas', 'Transportation'],
      '3% Cash Back on Groceries': ['Groceries'],
      '$50 Whole Foods Gift Card': ['Groceries'],
      '$100 Walmart Gift Card': ['Groceries', 'Shopping'],
      '$100 Amazon Gift Card': ['Shopping'],
      'Apple AirPods Pro': ['Shopping'],
      '$50 Netflix Gift Card': ['Entertainment'],
      '$50 Statement Credit': [
        'Groceries',
        'Dining',
        'Travel',
        'Gas',
        'Entertainment',
        'Shopping',
        'Utilities',
        'Healthcare',
        'Transportation',
      ],
      '$250 Cash Back': [
        'Groceries',
        'Dining',
        'Travel',
        'Gas',
        'Entertainment',
        'Shopping',
        'Utilities',
        'Healthcare',
        'Transportation',
      ],
      '2% Unlimited Cash Back': [
        'Groceries',
        'Dining',
        'Travel',
        'Gas',
        'Entertainment',
        'Shopping',
        'Utilities',
        'Healthcare',
        'Transportation',
      ],
    };

    const relevantCategories = rewardToCategoryMapping[reward.title] || [];
    relevantCategories.forEach((cat) => {
      if (categoryCount[cat]) score += categoryCount[cat] * 5;
    });
  }

  return Math.round(score);
};

// Helper: Calculate gamification prompts based on featured reward
const calculateGamification = (card, transactions, rewards = []) => {
  const featuredReward = rewards[0]; // one of top 3 dynamically scored rewards

  const message = featuredReward
    ? `You're making progress! Keep going and you could redeem "${featuredReward.title}" soon!`
    : "You're making progress! Keep checking for rewards.";

  const progressPercentage = 50;

  return {
    message,
    progressPercentage,
    pointsBalance: card.pointsBalance,
  };
};

module.exports = {
  getRecommendations: exports.getRecommendations,
  refreshRecommendations: exports.refreshRecommendations,
  getGamification: exports.getGamification,
};

