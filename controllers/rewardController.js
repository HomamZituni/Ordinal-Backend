// controllers/rewardController.js

const Reward = require('../models/Reward');
const Card = require('../models/Card');
const Transaction = require('../models/Transaction');

// IMPORTANT: Spend categories should NOT map to "Gift Cards" (too broad).
// Use Cash Back/Travel/Statement Credit for category-level fallbacks.
const categoryMapping = {
  Dining: 'Cash Back',
  Travel: 'Travel',
  Groceries: 'Cash Back',
  Gas: 'Cash Back',
  Entertainment: 'Cash Back',
  Shopping: 'Cash Back',
  Bills: 'Statement Credit',
  Other: 'Cash Back'
};

// ---------- Helpers ----------
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeText = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const textHasPhrase = (haystackNorm, phraseNorm) => {
  if (!phraseNorm) return false;
  const pattern = new RegExp(`(^|\\s)${escapeRegex(phraseNorm)}(\\s|$)`, 'i');
  return pattern.test(haystackNorm);
};

const saturate = (x, k) => {
  const v = Math.max(0, Number(x) || 0);
  const kk = Math.max(1e-9, Number(k) || 1);
  return v / (v + kk);
};

const stableJitter = (str) => {
  const s = String(str || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000000; // 0..0.001
};

// Dining-related non-merchant rewards you want to allow without direct merchant match
const isDiningAggregatorReward = (rewardTitleNorm) => {
  return (
    textHasPhrase(rewardTitleNorm, 'doordash') ||
    textHasPhrase(rewardTitleNorm, 'door dash') ||
    textHasPhrase(rewardTitleNorm, 'uber eats') ||
    textHasPhrase(rewardTitleNorm, 'ubereats') ||
    textHasPhrase(rewardTitleNorm, 'grubhub') ||
    textHasPhrase(rewardTitleNorm, 'restaurant com') ||
    textHasPhrase(rewardTitleNorm, 'restaurant')
  );
};

// Cash Back subcategory detection (prevents ties)
const cashBackSubcategoryFromTitle = (titleNorm) => {
  if (textHasPhrase(titleNorm, 'dining')) return 'Dining';
  if (textHasPhrase(titleNorm, 'gas')) return 'Gas';
  if (textHasPhrase(titleNorm, 'grocery') || textHasPhrase(titleNorm, 'groceries')) return 'Groceries';
  if (textHasPhrase(titleNorm, 'travel')) return 'Travel';
  if (textHasPhrase(titleNorm, 'bill') || textHasPhrase(titleNorm, 'bills')) return 'Bills';
  return null; // generic cash back
};

// Minimal alias bank (deterministic, avoids overly broad matching)
const getRewardMerchantAliases = (reward) => {
  const title = normalizeText(reward.title);
  const aliasBank = [
    { aliases: ['walmart'] },
    { aliases: ['whole foods', 'wholefoods'] },
    { aliases: ['kroger'] },
    { aliases: ['shell', 'shell gas'] },
    { aliases: ['chevron'] },
    { aliases: ['mcdonalds', 'mc donalds', 'mc donald s', 'mcdonald'] },
    { aliases: ['chipotle'] },
    { aliases: ['starbucks'] },
    { aliases: ['netflix'] },
    { aliases: ['lyft'] },
    { aliases: ['amazon'] },
    { aliases: ['apple'] },
    { aliases: ['best buy', 'bestbuy'] },
    { aliases: ['target'] },
    { aliases: ['verizon'] },
    { aliases: ['at t', 'att', 'at and t'] },
    { aliases: ['delta', 'delta airlines'] },
    { aliases: ['bp'] }
  ];

  const matches = [];
  for (const m of aliasBank) {
    for (const a of m.aliases) {
      const an = normalizeText(a);
      if (textHasPhrase(title, an)) matches.push(an);
    }
  }
  return [...new Set(matches)];
};

const getCategoryShareByTxCategory = (txCategory, userSpending) => {
  const amt = userSpending.categories[txCategory] || 0;
  return userSpending.total > 0 ? amt / userSpending.total : 0;
};

const getRewardCategoryShare = (rewardCategory, userSpending) => {
  let sum = 0;
  for (const [txCategory, mappedCategory] of Object.entries(categoryMapping)) {
    if (mappedCategory === rewardCategory) sum += userSpending.categories[txCategory] || 0;
  }
  return userSpending.total > 0 ? sum / userSpending.total : 0;
};

// Explainability helper: short "why this is recommended"
const buildReason = (reward, userSpending) => {
  const rewardCategory = reward.category;
  const titleNorm = normalizeText(reward.title);

  // Merchant match reason (best match by spend share)
  const aliases = getRewardMerchantAliases(reward);
  let best = { merchant: null, share: 0 };

  for (const [merchantRaw, merchantSpent] of Object.entries(userSpending.merchants || {})) {
    const merchantNorm = normalizeText(merchantRaw);
    const share = merchantSpent / userSpending.total;

    const tokens = merchantNorm.split(' ').filter(t => t.length >= 3);
    const direct =
      (merchantNorm && textHasPhrase(titleNorm, merchantNorm)) ||
      tokens.some(tok => textHasPhrase(titleNorm, tok)) ||
      aliases.some(a => textHasPhrase(merchantNorm, a) && textHasPhrase(titleNorm, a));

    if (direct && share > best.share) best = { merchant: merchantRaw, share };
  }

  if (best.merchant && (rewardCategory === 'Gift Cards' || rewardCategory === 'Travel')) {
  return `Because you spend at ${best.merchant}`;
}


  // Category reason fallback (short, front-facing)
  if (rewardCategory === 'Cash Back') {
    const sub = cashBackSubcategoryFromTitle(titleNorm);
    if (sub) return `Because you spend on ${sub.toLowerCase()}`;
    return 'Good all-around cash back';
  }

  if (rewardCategory === 'Travel') return 'Because you spend on travel';

  if (rewardCategory === 'Statement Credit') return 'Good for bills you pay often';

  if (rewardCategory === 'Gift Cards') {
    if (isDiningAggregatorReward(titleNorm)) return 'Popular option for dining spend';
    return 'Gift card option that fits your spending';
  }

  return 'Recommended for you';
};


// ---------- NBA scoring ----------
const calculateNBAScore = (reward, userSpending) => {
  if (!userSpending?.total) return 0;

  const rewardCategory = reward.category;
  const titleNorm = normalizeText(reward.title);

  // Only rank categories you intentionally score/recommend
  const ALLOWED = new Set(['Gift Cards', 'Cash Back', 'Travel', 'Statement Credit']);
  if (!ALLOWED.has(rewardCategory)) return 0;

  // 1) Merchant match (primary)
  const aliases = getRewardMerchantAliases(reward);

  let bestMerchantShare = 0;
  let merchantMatched = false;

  for (const [merchantRaw, merchantSpent] of Object.entries(userSpending.merchants || {})) {
    const merchantNorm = normalizeText(merchantRaw);
    const share = merchantSpent / userSpending.total;

    // Token match prevents punctuation / multi-word merchant issues
    const tokens = merchantNorm.split(' ').filter(t => t.length >= 3);

    const direct =
      (merchantNorm && textHasPhrase(titleNorm, merchantNorm)) ||
      tokens.some(tok => textHasPhrase(titleNorm, tok)) ||
      aliases.some(a => textHasPhrase(merchantNorm, a) && textHasPhrase(titleNorm, a));

    if (direct) {
      merchantMatched = true;
      bestMerchantShare = Math.max(bestMerchantShare, share);
    }
  }

  // 2) Category shares
  const categoryShare = getRewardCategoryShare(rewardCategory, userSpending);
  const diningShare = getCategoryShareByTxCategory('Dining', userSpending);

  // 3) Eligibility / gating
  if (rewardCategory === 'Gift Cards') {
    const isAgg = isDiningAggregatorReward(titleNorm);
    if (!merchantMatched && !(isAgg && diningShare >= 0.10)) return 0;
  }

  if (!merchantMatched && rewardCategory !== 'Gift Cards') {
    const MIN_CATEGORY_SHARE = 0.12;
    if (categoryShare < MIN_CATEGORY_SHARE && rewardCategory !== 'Statement Credit') return 0;
  }

  // 4) Score components (capped)
  const merchantComponent = merchantMatched ? (750 * saturate(bestMerchantShare, 0.10)) : 0;

  let relevantTxCount = 0;
  for (const [txCategory, mappedCategory] of Object.entries(categoryMapping)) {
    if (mappedCategory === rewardCategory) relevantTxCount += userSpending.transactionCounts[txCategory] || 0;
  }

  const categoryComponent =
    240 * saturate(categoryShare, 0.20) +
    70 * saturate(relevantTxCount, 6);

  const value = Number(reward.value) || 0;
  const points = Math.max(1, Number(reward.pointsCost) || 1);
  const valuePerPoint = value / points;
  const valueComponent = 110 * saturate(valuePerPoint, 0.008);

  // 5) Boosts (make them specific and non-tie-y)
  let boost = 0;

  if (rewardCategory === 'Statement Credit') {
    boost += 30;
  }

  if (rewardCategory === 'Travel') {
    const travelShare = getCategoryShareByTxCategory('Travel', userSpending);
    boost += 120 * saturate(travelShare, 0.12);
  }

  if (rewardCategory === 'Cash Back') {
    const sub = cashBackSubcategoryFromTitle(titleNorm);

    if (sub) {
      const subShare = getCategoryShareByTxCategory(sub, userSpending);
      boost += 220 * saturate(subShare, 0.12);
    } else {
      // Generic cash back stays weaker so it doesn't tie/beat category-specific items
      const cashBackShare = getRewardCategoryShare('Cash Back', userSpending);
      boost += 35 * saturate(cashBackShare, 0.25);
    }
  }

  // Dining aggregator boost (so DoorDash/Restaurant.com can appear for Dining-heavy cards)
  if (rewardCategory === 'Gift Cards' && isDiningAggregatorReward(titleNorm) && !merchantMatched) {
    boost += 120 * saturate(diningShare, 0.12);
  }

  // Penalties
  let penalty = 0;
  if (points > 30000) penalty += 25;
  if (!merchantMatched && points > 20000) penalty += 15;

  let score = merchantComponent + categoryComponent + valueComponent + boost - penalty;
  score += stableJitter(reward._id || reward.title);

  return Math.round(Math.max(0, score) * 100) / 100;
};

// ------------------------
// GET /api/cards/:cardId/rewards/ranked  (mounted at /api/cards/:cardId/rewards, so route is GET /ranked)
// Also supports older mounts using :id by falling back.
exports.getRankedRewards = async (req, res) => {
  try {
    const cardId = req.params.cardId || req.params.id;
    const userId = req.user._id;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const transactions = await Transaction.find({ user: userId, card: cardId })
      .sort({ date: -1 })
      .limit(100);

    if (!transactions.length) {
      return res.status(200).json({
        message: 'No transactions found for this card. Add transactions to see personalized rankings.',
        rewards: []
      });
    }

    const txCount = transactions.length;
    const resultLimit = txCount <= 3 ? Math.min(3, txCount) : 10;

    const userSpending = { total: 0, categories: {}, transactionCounts: {}, merchants: {} };
    transactions.forEach(t => {
      userSpending.total += t.amount;
      userSpending.categories[t.category] = (userSpending.categories[t.category] || 0) + t.amount;
      userSpending.transactionCounts[t.category] = (userSpending.transactionCounts[t.category] || 0) + 1;

      const merchantKey = normalizeText(t.merchant);
      if (merchantKey) userSpending.merchants[merchantKey] = (userSpending.merchants[merchantKey] || 0) + t.amount;
    });

    const rewards = await Reward.find({ isActive: true });
    if (!rewards.length) return res.status(200).json({ message: 'No rewards available.', rewards: [] });

    const rankedRewards = rewards
      .map(r => {
        const obj = r.toObject();
        const nbaScore = calculateNBAScore(r, userSpending);

        // Remove tier from this ranked payload (frontend can show `reason` instead)
        delete obj.tier;
        delete obj.__v;
        delete obj.createdAt;
        delete obj.updatedAt;


        return {
          ...obj,
          nbaScore,
          reason: buildReason(r, userSpending)
        };
      })
      .filter(r => r.nbaScore > 0)
      .sort((a, b) => b.nbaScore - a.nbaScore)
      .slice(0, resultLimit);

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
// GET /api/cards/:cardId/rewards (mounted at /api/cards/:cardId/rewards, so route is GET /)
// Also supports older mounts using :id by falling back.
exports.getCardRewards = async (req, res) => {
  try {
    const cardId = req.params.cardId || req.params.id;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view rewards for this card' });
    }

    const tierHierarchy = ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium'];
    const cardTierIndex = tierHierarchy.indexOf(card.rewardsTier);

    const rewards = await Reward.find({
      isActive: true,
      tier: { $in: tierHierarchy.slice(0, cardTierIndex + 1) }
    }).sort('pointsCost')
    .limit(6);

    res.status(200).json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




