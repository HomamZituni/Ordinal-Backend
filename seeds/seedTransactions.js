require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => console.error('MongoDB connection error:', err));

// merchant-category mappings + realistic amount ranges
const merchantsData = [
  { name: 'Whole Foods', category: 'Groceries', min: 50, max: 150 },
  { name: 'Kroger', category: 'Groceries', min: 40, max: 120 },
  { name: 'Walmart', category: 'Groceries', min: 30, max: 200 },
  { name: 'Target', category: 'Groceries', min: 30, max: 150 },
  { name: 'Chipotle', category: 'Dining', min: 8, max: 25 },
  { name: 'Starbucks', category: 'Dining', min: 5, max: 20 },
  { name: 'McDonald\'s', category: 'Dining', min: 6, max: 25 },
  { name: 'Shell Gas', category: 'Gas', min: 30, max: 70 },
  { name: 'BP', category: 'Gas', min: 30, max: 70 },
  { name: 'Chevron', category: 'Gas', min: 30, max: 70 },
  { name: 'Amazon', category: 'Shopping', min: 20, max: 150 },
  { name: 'Best Buy', category: 'Shopping', min: 50, max: 300 },
  { name: 'Apple Store', category: 'Shopping', min: 50, max: 400 },
  { name: 'Netflix', category: 'Entertainment', min: 10, max: 20 },
  { name: 'Spotify', category: 'Entertainment', min: 10, max: 20 },
  { name: 'Delta Airlines', category: 'Travel', min: 50, max: 400 },
  { name: 'Uber', category: 'Travel', min: 10, max: 50 },
  { name: 'Lyft', category: 'Travel', min: 10, max: 50 },
  { name: 'AT&T', category: 'Bills', min: 50, max: 200 },
  { name: 'Verizon', category: 'Bills', min: 50, max: 200 }
];

const getRandomAmount = (min, max) => {
  return Math.floor(Math.random() * (max * 100 - min * 100 + 1) + min * 100) / 100;
};

const seedTransactions = async () => {
  try {
    // Clear existing transactions
    await Transaction.deleteMany({});
    console.log('Cleared existing transactions');

    // Get all users
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    // For each user, get their cards and create transactions
    for (const user of users) {
      const cards = await Card.find({ user: user._id });
      
      for (const card of cards) {
        const numTransactions = Math.floor(Math.random() * 10) + 10; // 10-20 transactions per card
        const transactions = [];

        for (let i = 0; i < numTransactions; i++) {
          // Pick random merchant
          const merchant = merchantsData[Math.floor(Math.random() * merchantsData.length)];
          
          // Generate random date in last 60 days
          const daysAgo = Math.floor(Math.random() * 60);
          const transactionDate = new Date();
          transactionDate.setDate(transactionDate.getDate() - daysAgo);

          // Generate realistic amount for merchant
          const amount = getRandomAmount(merchant.min, merchant.max);

          transactions.push({
            user: user._id,
            card: card._id,
            merchant: merchant.name,
            category: merchant.category,
            amount,
            date: transactionDate,
            description: `Purchase at ${merchant.name}`
          });
        }

        await Transaction.insertMany(transactions);
        console.log(`Created ${transactions.length} transactions for card: ${card.cardName} (${card._id})`);
      }
    }

    console.log('Transaction seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding transactions:', error);
    process.exit(1);
  }
};

seedTransactions();


