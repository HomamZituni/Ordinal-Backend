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


    // Check if card exists and user owns it
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }


    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }


    // Get user to check AI toggle
    const user = await User.findById(req.user._id);


    // Get eligible rewards (tier-based)
    const tierHierarchy = ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium'];
    const cardTierIndex = tierHierarchy.indexOf(card.rewardsTier);


    let rewards = await Reward.find({
      isActive: true,
      tier: { $in: tierHierarchy.slice(0, cardTierIndex + 1) }
    });


    // Get recent transactions for NBA scoring
    const recentTransactions = await Transaction.find({ 
      card: cardId 
    }).sort('-date').limit(20);


    // If AI is enabled, apply NBA scoring and rank
    if (user.aiEnabled) {
      rewards = rewards.map(reward => {
        const score = calculateNBAScore(reward, card, recentTransactions);
        return { ...reward.toObject(), nbaScore: score };
      });


      // Sort by NBA score (highest first)
      rewards.sort((a, b) => b.nbaScore - a.nbaScore);
    } else {
      // If AI is off, return simple list sorted by points cost
      rewards.sort((a, b) => a.pointsCost - b.pointsCost);
    }


    res.status(200).json({
      aiEnabled: user.aiEnabled,
      recommendations: rewards
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Refresh recommendations (recalculate after transaction update)
// @route   POST /api/cards/:cardId/recommendations/refresh
// @access  Private
exports.refreshRecommendations = async (req, res) => {
  try {
    const { cardId } = req.params;


    // Check if card exists and user owns it
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }


    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }


    // Get user to check AI toggle
    const user = await User.findById(req.user._id);


    // Get eligible rewards
    const tierHierarchy = ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium'];
    const cardTierIndex = tierHierarchy.indexOf(card.rewardsTier);


    let rewards = await Reward.find({
      isActive: true,
      tier: { $in: tierHierarchy.slice(0, cardTierIndex + 1) }
    });


    // Get recent transactions
    const recentTransactions = await Transaction.find({ 
      card: cardId 
    }).sort('-date').limit(20);


    // Calculate gamification data
    const gamification = calculateGamification(card, recentTransactions, tierHierarchy);


    // If AI is enabled, apply NBA scoring
    if (user.aiEnabled) {
      rewards = rewards.map(reward => {
        const score = calculateNBAScore(reward, card, recentTransactions);
        return { ...reward.toObject(), nbaScore: score };
      });


      rewards.sort((a, b) => b.nbaScore - a.nbaScore);
    } else {
      rewards.sort((a, b) => a.pointsCost - b.pointsCost);
    }


    res.status(200).json({
      message: 'Recommendations refreshed',
      aiEnabled: user.aiEnabled,
      gamification,
      recommendations: rewards
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

    if (!cards || cards.length === 0) {
      return res.status(404).json({ message: 'No cards found' });
    }

    const tierHierarchy = ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium'];
    const gamificationData = [];

    for (const card of cards) {
      const recentTransactions = await Transaction.find({ 
        card: card._id 
      }).sort('-date').limit(20);

      const gamification = calculateGamification(card, recentTransactions, tierHierarchy);
      
      gamificationData.push({
        cardId: card._id,
        cardName: card.cardName,
        ...gamification
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

  // Factor 1: Affordability (can user redeem now?)
  if (card.pointsBalance >= reward.pointsCost) {
    score += 50; // High priority if affordable
  } else {
    // Closer to affordable = higher score
    const percentAffordable = (card.pointsBalance / reward.pointsCost) * 100;
    score += percentAffordable * 0.3;
  }

  // Factor 2: Value efficiency (cents per point)
  const valuePerPoint = (reward.value / reward.pointsCost) * 100;
  score += valuePerPoint * 0.5;

  // Factor 3: Category alignment with recent spending
  if (transactions.length > 0) {
    const categoryCount = {};
    transactions.forEach(t => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });

    // Map reward titles to transaction categories they benefit from
    const rewardToCategoryMapping = {
      // Dining rewards
      '5% Cash Back on Dining': ['Dining'],
      '$50 Restaurant.com Gift Card': ['Dining'],
      '$100 DoorDash Credit': ['Dining'],
      'Gourmet Dinner Experience': ['Dining'],
      
      // Travel rewards
      'Round-Trip Domestic Flight': ['Travel'],
      'Hotel Stay (2 Nights)': ['Travel'],
      '$200 Airbnb Credit': ['Travel'],
      '3% Travel Bonus': ['Travel'],
      
      // Gas rewards
      '4% Cash Back on Gas': ['Gas'],
      '$75 Shell Gas Card': ['Gas'],
      'Free Car Wash Package': ['Gas', 'Transportation'],
      
      // Grocery rewards
      '3% Cash Back on Groceries': ['Groceries'],
      '$50 Whole Foods Gift Card': ['Groceries'],
      '$100 Walmart Gift Card': ['Groceries', 'Shopping'],
      
      // Shopping/Entertainment
      '$100 Amazon Gift Card': ['Shopping'],
      'Apple AirPods Pro': ['Shopping'],
      '$50 Netflix Gift Card': ['Entertainment'],
      
      // General rewards (benefit from all spending)
      '$50 Statement Credit': ['Groceries', 'Dining', 'Travel', 'Gas', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Transportation'],
      '$250 Cash Back': ['Groceries', 'Dining', 'Travel', 'Gas', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Transportation'],
      '2% Unlimited Cash Back': ['Groceries', 'Dining', 'Travel', 'Gas', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Transportation']
    };

    const relevantCategories = rewardToCategoryMapping[reward.title] || [];
    
    // Boost score for each transaction in relevant categories
    relevantCategories.forEach(cat => {
      if (categoryCount[cat]) {
        score += categoryCount[cat] * 5; // Significant boost for category match
      }
    });
  }

  // Factor 4: Tier relevance (prefer rewards at user's tier level)
  const tierHierarchy = ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium'];
  const tierDifference = Math.abs(
    tierHierarchy.indexOf(card.rewardsTier) - tierHierarchy.indexOf(reward.tier)
  );
  score += (5 - tierDifference) * 5;

  return Math.round(score);
};



// Helper: Calculate gamification prompts
const calculateGamification = (card, transactions, tierHierarchy) => {
  const currentTierIndex = tierHierarchy.indexOf(card.rewardsTier);
  const nextTier = tierHierarchy[currentTierIndex + 1];


  // Calculate total spending (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);


  const recentSpending = transactions
    .filter(t => new Date(t.date) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);


  // Tier thresholds (example values - adjust as needed)
  const tierThresholds = {
    'Basic': 0,
    'Silver': 1000,
    'Gold': 5000,
    'Platinum': 15000,
    'Premium': 50000
  };


  let message = '';
  let progressPercentage = 0;


  if (nextTier) {
    const nextTierThreshold = tierThresholds[nextTier];
    const amountNeeded = nextTierThreshold - recentSpending;


    if (amountNeeded > 0) {
      progressPercentage = Math.round((recentSpending / nextTierThreshold) * 100);
      message = `You're $${amountNeeded.toFixed(2)} away from ${nextTier} tier—keep spending to unlock better redemptions!`;
    } else {
      message = `Congratulations! You qualify for ${nextTier} tier. Contact support to upgrade.`;
      progressPercentage = 100;
    }
  } else {
    message = `You've reached Premium tier—enjoy the best rewards available!`;
    progressPercentage = 100;
  }


  return {
    currentTier: card.rewardsTier,
    nextTier: nextTier || null,
    message,
    progressPercentage,
    recentSpending: recentSpending.toFixed(2),
    pointsBalance: card.pointsBalance
  };
};


module.exports = { 
  getRecommendations: exports.getRecommendations, 
  refreshRecommendations: exports.refreshRecommendations,
  getGamification: exports.getGamification
};


